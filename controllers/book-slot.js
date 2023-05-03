const { validationResult } = require("express-validator")
const User = require("../models/user");
const VaccinationCentre = require("../models/vaccination-centre");
const VaccineStock = require("../models/vaccine-stock");
const BookSlot = require("../models/book-slot");
const vaccinationCentre = require("../models/vaccination-centre");

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
        const { name, centre_name, vaccine, paid, date } = req.body;

        // First fetch the vaccines and the bookings attribute from the VaccinationCentre database,
        // Then fetch the VaccineStock details
        // If VaccinationCentre details is found, means VaccinationStock also exists,
        // So we don't need to check it explictly
        const vaccinationCentreDetails = await VaccinationCentre.findById(vaccinationCentreId, 'vaccines bookings').exec();
        if (!vaccinationCentreDetails) {
            return res.status(400).json({ error: "vaccination centre not found" });
        }
        const vaccineStockDetails = await VaccineStock.findById(vaccinationCentreDetails.vaccines);

        // Also checking User exists in database
        const userDetails = await User.findById(userId, "appointments").exec();
        if (!userDetails) {
            return res.status(400).json({ error: "user does not exists" });
        }


        for (let i = 0; i < vaccineStockDetails.vaccine.length; i++) {
            if (vaccineStockDetails.vaccine[i] == vaccine && vaccineStockDetails.paid[i] == paid && vaccineStockDetails.stock[i] > 0) {
                // Updating the stock
                vaccineStockDetails.stock--;
                await vaccineStockDetails.save();

                // Storing the booking into the BookSlot database
                const bookSlot = new BookSlot(req.body);
                const bookSlotData = await bookSlot.save();

                // Storing the bookSlot id into the User and VaccineCentre database
                userDetails.appointments.push(bookSlotData._id);
                await userDetails.save();
                vaccinationCentreDetails.bookings.push(bookSlotData._id);
                await vaccinationCentreDetails.save();

                return res.status(200).json({ msg: "done" });
            }
        }
        return res.status(400).json({ error: "vaccine does not exists in stock" });
    } catch (error) {
        return res.status(400).json({ error: error });
    }

}