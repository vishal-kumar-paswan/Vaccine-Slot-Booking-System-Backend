const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { bookSlot, approveBooking } = require("../controllers/book-slot");

// Book slot
router.post("/book-slot/:vaccinationCentreId/:userId",
    [
        check("vaccine", "Vaccine is required").exists(),
        check("vaccine", "Vaccine should be atleast 2 characters").isLength({ min: 2 }),
        check("paid", "Paid is required").exists(),
        check("paid", "Paid must be boolean").isBoolean()
    ],
    bookSlot
);

// Approve bookings and send date
router.post("/approve-booking/:bookingId",
    [
        check("approved", "approved is required").exists(),
        check("approved", "approved must be boolean").isBoolean(),
    ],
    approveBooking
);

module.exports = router;