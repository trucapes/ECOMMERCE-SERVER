const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
    {
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