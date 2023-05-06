const { validationResult } = require("express-validator");
const { signupMail } = require("./email");
const User = require("../models/user");
const VaccinationCentre = require("../models/vaccination-centre");

// User sign up
exports.signup = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                error: errors.array()[0].msg,
                params: errors.array()[0].param,
            });
        }

        const { email, phone } = req.body;
        const emailExists = await User.findOne({ email }, 'email -_id').exec();
        const phoneExists = await User.findOne({ phone }, 'phone -_id').exec();

        if (emailExists) {
            return res.status(400).json({ error: "Email is already registered" });
        }
        if (phoneExists) {
            return res.status(400).json({ error: "Phone number is already registered" });
        }

        const user = new User(req.body);
        const userData = await user.save();

        // Sending a confirmation mail
        signupMail(email, req.body.name);

        return res.status(200).json({
            id: userData._id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            address: userData.address
        });
    } catch (error) {
        return res.status(400).json({ error: error });
    }
}

// User sign in
exports.signin = async (req, res) => {
    try {
        // Fetching errors using Express validator
        const errors = validationResult(req);

        // If errors exists, return status code 422 with an error message
        if (!errors.isEmpty()) {
            return res.status(422).json({
                error: errors.array()[0].msg,
                params: errors.array()[0].param,
            });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email })
            .populate({ path: "appointments", model: "BookSlot", select: '-_id -__v' }).exec();


        if (!user) {
            return res.status(400).json({ error: "User does not exist" });
        }

        if (user.authenticate(password)) {
            const { _id, name, email, phone, address, appointments } = user;

            // Array for storing all the appointmentObjects
            let appointmentData = [];

            // Iterating through all appointments elements
            for (let i = 0; i < appointments.length; i++) {
                let appointmentObject = {};

                // Fetching name and centre_name from User and VaccinationCentre database
                const userData = await User.findById(appointments[i].userId, "name").exec();
                const vaccinationCentreData = await VaccinationCentre.findById(appointments[i].centreId, "centre_name").exec();

                // Adding all data into the object
                appointmentObject.name = userData.name;
                appointmentObject.centre_name = vaccinationCentreData.centre_name;
                appointmentObject.vaccine = appointments[i].vaccine;
                appointmentObject.paid = appointments[i].paid;
                appointmentObject.approved = appointments[i].approved;
                appointmentObject.date = appointments[i].date;

                // pushing element into the array
                appointmentData.push(appointmentObject);
            }

            return res.status(200).json({
                id: _id,
                name: name,
                email, email,
                phone: phone,
                address, address,
                appointments: appointmentData
            });
        } else {
            return res.status(400).json({ error: "Password is incorrect" });
        }
    } catch (error) {
        return res.status(400).json({ error: error });
    }
}