const { validationResult } = require("express-validator");

const User = require("../models/user");


exports.signIn = async (req, res) => {
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

        const user = await User.findOne({ email }).exec();

        if (user != null) {
            const { password: userPassword } = user;
            if (userPassword === password) {
                const { name, email, phone, address } = user;
                return res.status(200).json({ name: name, email, email, phone: phone, address, address });
            } else {
                return res.status(400).json({ error: "Password is incorrect" });
            }
        } else {
            return res.status(400).json({ message: "User does not exist" });
        }
    } catch (error) {
        return res.status(400).json({ error: "Failed to sign in" });
    }
}

exports.signUp = (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                error: errors.array()[0].msg,
                params: errors.array()[0].param,
            });
        }

        const user = new User(req.body);
        user.save();

        return res.status(200).json({ message: "Sign up successful!" });
    } catch (error) {
        return res.status(400).json({ error: "Failed to sign up" });
    }
}