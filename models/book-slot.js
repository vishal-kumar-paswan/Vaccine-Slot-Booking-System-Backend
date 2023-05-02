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
    date: {
        type: Date,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
});

// Defining bookSlotSchema methods
bookSlotSchema.methods = {
    vaccinated: function () {
        this.completed = true;
    }
};

module.exports = mongoose.model("BookSlot", bookSlotSchema);