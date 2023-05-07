const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { signin, signup, getAppointments } = require("../controllers/user");

router.post("/signup",
    [
        check("name", "Name is required").exists(),
        check("name", "Name should be atleast 3 characters").isLength({ min: 3 }),
        check("email", "Email is required").exists(),
        check("email", "Enter a valid email").isEmail(),
        check("phone", "Phone number is required").exists(),
        check("phone", "Enter a valid phone number").isLength({ min: 2 }),
        check("address", "Address is required").exists(),
        check("address", "Enter a valid address").isLength({ min: 3 }),
        check("password", "Name is required").exists(),
        check("password", "Password should be atleast 3 characters").isLength({ min: 3 }),
    ],
    signup
);

router.post("/signin",
    [
        check("email", "Email is required").exists(),
        check("email", "Enter a valid email").isEmail(),
        check("password", "Name is required").exists(),
        check("password", "Password should be atleast 3 characters").isLength({ min: 3 }),
    ],
    signin
);

router.get("/appointments/:userId", getAppointments);

module.exports = router;