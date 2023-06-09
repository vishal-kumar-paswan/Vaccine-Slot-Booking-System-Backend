const mongoose = require("mongoose");

// Defining Vaccination Centre schema
const vaccineStockSchema = new mongoose.Schema({
    vaccine: {
        type: Array,
        default: [String],
    },
    stock: {
        type: Array,
        default: [Number],
    },
    paid: {
        type: Array,
        default: [Boolean]
    }
}, { timestamps: true });

module.exports = mongoose.model("VaccineStock", vaccineStockSchema);