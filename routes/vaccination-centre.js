const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { registerVaccinationCentre, loginToVaccinationCentre, searchVaccinationCentresUsingPIN, searchVaccinationCentresUsingDistrict, getVaccinationCentreDetails, addVaccine, updateStock } = require("../controllers/vaccination-centre");

// Registration route
router.post("/register-vaccination-centre",
    [
        check("centre_name", "Centre name is required").exists(),
        check("centre_name", "Centre name should be atleast 3 characters").isLength({ min: 3 }),

        check("email", "Email is required").exists(),
        check("email", "Enter a valid email").isEmail(),

        check("phone", "Phone number is required").exists(),
        check("phone", "Enter a valid phone number").isLength({ min: 2 }),

        check("address", "Address is required").exists(),
        check("address", "Enter a valid address").isLength({ min: 2 }),

        check("pin_code", "PIN code is required").exists(),
        check("pin_code", "Enter a valid PIN code").isNumeric(),

        check("district", "District is required").exists(),
        check("district", "Enter a valid district").isLength({ min: 2 }),

        check("state", "State is required").exists(),
        check("state", "Enter a valid state").isLength({ min: 2 }),

        check("auth_key", "Authorization key is required").exists(),
        check("auth_key", "Enter a valid authorization key").isLength({ min: 3 }),

        check("password", "Password is required").exists(),
        check("password", "Password should be atleast 3 characters").isLength({ min: 3 }),
    ],
    registerVaccinationCentre
);

// Login route
router.post("/login-to-vaccination-centre",
    [
        check("email", "Email is required").exists(),
        check("email", "Enter a valid email").isEmail(),

        check("password", "Password is required").exists(),
        check("password", "Password should be atleast 3 characters").isLength({ min: 3 }),
    ],
    loginToVaccinationCentre
);


// Search using PIN route
router.get("/search-vaccination-centres-using-pin/:pincode", searchVaccinationCentresUsingPIN);

// Search using district route
router.get("/search-vaccination-centres-using-district/:district", searchVaccinationCentresUsingDistrict);

// Get centre details route
router.get("/get-vaccination-centre-details/:vaccinationcentreid", getVaccinationCentreDetails);

// Add new vaccine
router.post("/add-vaccine/:vaccinationcentreid",
    [
        check("name", "name is required").exists(),
        check("name", "name must be string").isString(),
        check("name", "name cannot be empty").isLength({ min: 1 }),

        check("count", "count is required").exists(),
        check("count", "count must be integer").isInt(),

        check("paid", "paid is required").exists(),
        check("paid", "paid must be boolean").isBoolean(),
    ],
    addVaccine
);

// Update vaccine stock route
router.put("/update-stock/:vaccinationcentreid",
    [
        check("name", "name is required").exists(),
        check("name", "name must be string").isString(),
        check("name", "name cannot be empty").isLength({ min: 1 }),

        check("count", "count is required").exists(),
        check("count", "count must be integer").isInt(),

        check("paid", "paid is required").exists(),
        check("paid", "paid must be boolean").isBoolean(),
    ],
    updateStock
);

module.exports = router;