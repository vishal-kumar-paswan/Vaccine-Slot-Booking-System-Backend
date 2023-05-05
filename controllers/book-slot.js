const { validationResult } = require("express-validator");
const { bookingRequestMail, bookingApprovedMail, bookingDeclinedMail } = require("./email");
const User = require("../models/user");
const VaccinationCentre = require("../models/vaccination-centre");
const VaccineStock = require("../models/vaccine-stock");
const BookSlot = require("../models/book-slot");
const { ObjectId } = require("mongodb");

// Book slot
exports.bookSlot = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                error: errors.array()[0].msg,
                params: errors.array()[0].param,
            });
        }

        const vaccinationCentreId = req.params.vaccinationCentreId;
        const userId = req.params.userId;
        const { vaccine, paid } = req.body;

        // First fetch the vaccines and the bookings attribute from the VaccinationCentre database,
        // Then fetch the VaccineStock details
        // If VaccinationCentre details is found, means VaccinationStock also exists,
        // So we don't need to check it explictly
        const vaccinationCentreDetails = await VaccinationCentre.findById(vaccinationCentreId, 'centre_name vaccines bookings').exec();
        if (!vaccinationCentreDetails) {
            return res.status(400).json({ error: "vaccination centre not found" });
        }
        const vaccineStockDetails = await VaccineStock.findById(vaccinationCentreDetails.vaccines);

        // Also checking User exists in database
        const userDetails = await User.findById(userId, "name email appointments")
            .populate({
                path: "appointments",
                model: "BookSlot",
                select: '-_id -__v'
            }).exec();

        if (!userDetails) {
            return res.status(400).json({ error: "user does not exists" });
        }

        // Checking if there exists any previous bookings
        if (userDetails.appointments.length > 0) {
            for (let i = 0; i < userDetails.appointments.length; i++) {
                if (userDetails.appointments[i].vaccine == vaccine && userDetails.appointments[i].paid == paid) {
                    return res.status(400).json({ error: "cannot book same vaccine twice" });
                }
            }
        }

        // Checking if the vaccine exist in the database
        for (let i = 0; i < vaccineStockDetails.vaccine.length; i++) {
            if (vaccineStockDetails.vaccine[i] == vaccine &&
                vaccineStockDetails.paid[i] == paid &&
                vaccineStockDetails.stock[i] > 0
            ) {
                // Storing the booking request into the BookSlot database
                const bookSlotObject = {
                    userId: userId,
                    centreId: vaccinationCentreId,
                    vaccine: vaccine,
                    paid: paid
                }

                const bookSlot = new BookSlot(bookSlotObject);
                const bookSlotData = await bookSlot.save();

                // Storing the bookSlot id into the User and VaccineCentre database
                userDetails.appointments.push(bookSlotData._id);
                await userDetails.save();
                vaccinationCentreDetails.bookings.push(bookSlotData._id);
                await vaccinationCentreDetails.save();

                // Sending a email to user
                bookingRequestMail(userDetails.email, userDetails.name, vaccinationCentreDetails.centre_name);
                return res.status(200).json({ msg: "booking instance created successfully" });
            }
        }
        return res.status(400).json({ error: "failed to create booking instance" });
    } catch (error) {
        return res.status(400).json({ error: error });
    }
}

// Approve / Decline booking request
exports.approveBooking = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                error: errors.array()[0].msg,
                params: errors.array()[0].param,
            });
        }

        const bookingId = req.params.bookingId;
        const { approved, date } = req.body;

        // Fetching booking details from the database
        // Also polulating it with User and VaccinationCentre data
        const bookingInstance = await BookSlot.findById(bookingId, "-createdAt -updatedAt -__v")
            .populate("userId", "-_id name email")
            .populate("centreId", "-_id centre_name vaccines address").exec();

        // Checking if bookingInstance exists or not
        if (!bookingInstance) {
            return res.status(400).json({ error: "no booking instance exists with this booking id" });
        }

        const name = bookingInstance.userId.name;
        const email = bookingInstance.userId.email;
        const centre_name = bookingInstance.centreId.centre_name;
        const address = bookingInstance.centreId.address;
        bookingInstance.approval(approved);
        await bookingInstance.save();

        // If the approval is declined a mail and error message will be returned
        if (!approved) {
            bookingDeclinedMail(email, name);
            return res.status(403).json({ error: "request declined by vaccination centre" });
        }

        // Since the approval is true, we'll be fetching the VaccineStock details from the database
        const vaccineStockDetails = await VaccineStock.findById(bookingInstance.centreId.vaccines, "vaccine stock paid");

        // We'll be searching for the vaccine user asked for into the array
        for (let i = 0; i < vaccineStockDetails.vaccine.length; i++) {
            if (vaccineStockDetails.vaccine[i] == bookingInstance.vaccine &&
                vaccineStockDetails.paid[i] == bookingInstance.paid &&
                vaccineStockDetails.stock[i] > 0
            ) {
                // If vaccine exists, we'll be reducing the stock by 1
                --vaccineStockDetails.stock[i];
                await vaccineStockDetails.save();
                bookingApprovedMail(email, name, centre_name, address, date, bookingId);
                return res.status(200).json({ msg: "request approved by vaccination centre" });
            }
        }
        return res.status(400).json({ error: "failed to approve booking instance" });
    } catch (error) {
        return res.status(400).json({ error: error });
    }
}