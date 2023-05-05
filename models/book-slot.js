const mongoose = require("mongoose");

const bookSlotSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    centre_name: {
        type: String,
        required: true,
        trim: true
    },
    centreId: {
        type: mongoose.Schema.Types.ObjectId,
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
    }
});

// Defining bookSlotSchema methods
bookSlotSchema.methods = {
    approval: function (value) {
        this.approved = value;
    }
};

module.exports = mongoose.model("BookSlot", bookSlotSchema);