const mongoose = require("mongoose");

const bookSlotSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    centre_name: {
        type: String,
        required: true,
        trim: true
    },
    vaccine: {
        type: String,
        required: true,
        trim: true
    },
    paid: {
        type: Boolean,
        required: true
    },
    approved: {
        type: Boolean,
        default: null
    }
});

// Defining bookSlotSchema methods
bookSlotSchema.methods = {
    approval: function (value) {
        this.approved = value;
    }
};

module.exports = mongoose.model("BookSlot", bookSlotSchema);