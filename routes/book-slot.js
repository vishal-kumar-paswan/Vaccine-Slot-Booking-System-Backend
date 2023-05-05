const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { bookSlot } = require("../controllers/book-slot");

// Book slot
router.post("/book-slot/:vaccinationCentreId/:userId",
    [
        check("name", "Name is required").exists(),
        check("name", "Name should be atleast 2 characters").isLength({ min: 2 }),
        check("centre_name", "Vaccination centre name is required").exists(),
        check("centre_name", "Vaccination centre name should be atleast 2 characters").isLength({ min: 2 }),
        check("email", "email is required").exists(),
        check("email", "please provide a valid email").isEmail(),
        check("vaccine", "Vaccine is required").exists(),
        check("vaccine", "Vaccine should be atleast 2 characters").isLength({ min: 2 }),
        check("paid", "Paid is required").exists(),
        check("paid", "Paid must be boolean").isBoolean()
    ],
    bookSlot
);

// Get all bookings of the vaccination centre
router.get("/bookings/:vaccinationCentreId", bookSlot);

// Approve bookings and send date
router.post("/approve-booking/:vaccinationCentreId/:bookingId",
    [
        check("approved", "approved is required").exists(),
        check("approved", "approved must be boolean").isBoolean(),
        check("date", "date must be string").isString(),
    ],
    bookSlot
);

module.exports = router;