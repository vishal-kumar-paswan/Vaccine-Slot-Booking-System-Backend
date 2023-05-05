const { validationResult } = require("express-validator")
const nodemailer = require("nodemailer");
const User = require("../models/user");
const VaccinationCentre = require("../models/vaccination-centre");
const VaccineStock = require("../models/vaccine-stock");
const BookSlot = require("../models/book-slot");
const vaccinationCentre = require("../models/vaccination-centre");

const bookingRequestMail = async (email, name, centre_name) => {
    const mailTemplate =
        `
Dear ${name},
Thank you for booking your vaccination through eVaccination Portal. You'll be receiving a confirmation mail once your request has been approved by ${centre_name}.

Regards,
eVaccination Portal Team.
`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 300,
        secure: true,
        logger: true,
        debug: true,
        secureConnection: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASSWORD
        },
        tls: {
            rejectUnauthorized: true
        },
    });

    transporter.verify((err, success) => {
        if (err) console.error("Erorrr::", err);
        console.log("Success: ", success);
    });

    var mailOptions = {
        from: `"eVaccination Portal" <${process.env.EMAIL}>`,
        to: email,
        subject: 'Vaccination Request Submitted!',
        text: mailTemplate
    };

    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Error occured: ", error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

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
        const { name, centre_name, email, vaccine, paid } = req.body;

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
        const userDetails = await User.findById(userId, "-createdAt -updatedAt -__v")
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
            if (vaccineStockDetails.vaccine[i] == vaccine && vaccineStockDetails.paid[i] == paid && vaccineStockDetails.stock[i] > 0) {
                // Storing the booking request into the BookSlot database
                const bookSlot = new BookSlot(req.body);
                const bookSlotData = await bookSlot.save();

                // Storing the bookSlot id into the User and VaccineCentre database
                userDetails.appointments.push(bookSlotData._id);
                await userDetails.save();
                vaccinationCentreDetails.bookings.push(bookSlotData._id);
                await vaccinationCentreDetails.save();

                // Sending a email to user
                bookingRequestMail(email, name, centre_name);
                return res.status(200).json({ msg: "booking instance created successfully" });
            }
        }
        return res.status(400).json({ error: "failed to create booking instance" });
    } catch (error) {
        return res.status(400).json({ error: error });
    }
}