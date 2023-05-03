const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { bookSlot } = require("../controllers/book-slot");

router.post("/book-slot/:vaccinationCentreId/:userId",
    [
        check("name", "Name is required").exists(),
        check("name", "Name should be atleast 2 characters").isLength({ min: 2 }),
        check("centre_name", "Vaccination centre name is required").exists(),
        check("centre_name", "Vaccination centre name should be atleast 2 characters").isLength({ min: 2 }),
        check("vaccine", "Vaccine is required").exists(),
        check("vaccine", "Vaccine should be atleast 2 characters").isLength({ min: 2 }),
        check("paid", "Paid is required").exists(),
        check("paid", "Paid must be boolean").isBoolean(),
        check("date", "Date is required").exists(),
        check("date", "Provide correct date format").isInt()
    ],
    bookSlot
);

module.exports = router;