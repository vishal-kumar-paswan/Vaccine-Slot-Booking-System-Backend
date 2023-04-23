const mongoose = require("mongoose");

// Defining Vaccination Centre schema
const vaccinationCentreSchema = new mongoose.Schema({
    centre_name: {
        type: String,
        required: true,
        maxLength: 32,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    pin_code: {
        type: Number,
        required: true,
        trim: true,
        maxLength: 6
    },
    district: {
        type: String,
        required: true,
        trim: true,
    },
    state: {
        type: String,
        required: true,
        trim: true,
    },
    vaccines: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VaccineStock"
    },
    available_slots: {
        type: [Date]
    },
    paid: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true,
        trim: true,
    }
}, { timestamps: true });

// Defining userSchema methods
vaccinationCentreSchema.methods = {
    // authenticate while signing in
    authenticate: function (plainPassword) {
        return plainPassword === this.password
    }
};

module.exports = mongoose.model("VaccinationCentre", vaccinationCentreSchema);