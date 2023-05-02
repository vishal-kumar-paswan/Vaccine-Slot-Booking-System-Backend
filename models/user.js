const mongoose = require("mongoose");

// Defining User schema
const userSchema = new mongoose.Schema({
    name: {
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
    password: {
        type: String,
        required: true,
        trim: true,
    },
    appointments: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: "BookSlot"
    }
}, { timestamps: true });

// Defining userSchema methods
userSchema.methods = {
    authenticate: function (plainPassword) {
        return plainPassword === this.password
    },
};

module.exports = mongoose.model("User", userSchema);