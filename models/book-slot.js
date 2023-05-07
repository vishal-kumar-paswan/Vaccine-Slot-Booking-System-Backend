const mongoose = require("mongoose");

const bookSlotSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    centreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VaccinationCentre",
        required: true
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
    },
    date: {
        type: String,
        default: null
    }
}, { timestamps: true });

// Defining bookSlotSchema methods
bookSlotSchema.methods = {
    approval: function (value) {
        this.approved = value;
    }
};

module.exports = mongoose.model("BookSlot", bookSlotSchema);