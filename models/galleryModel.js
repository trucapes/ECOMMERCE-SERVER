const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        }
    }
);

module.exports = mongoose.model("Gallery", gallerySchema);