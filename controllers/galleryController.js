const Gallery = require("../models/galleryModel");

const getGallery = async (req, res) => {
    try {
        const gallery = await Gallery.find().sort({ createdAt: -1 });
        res.status(200).json({ error: false, gallery });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
}

// get gallary with pagination
const getGalleryWithPagination = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skipIndex = (page - 1) * limit;

    try {
        const gallery = await Gallery.find().sort({ createdAt: -1 }).limit(limit).skip(skipIndex);
        res.status(200).json({ error: false, gallery });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
}

const addGallery = async (req, res) => {
    const {title, url } = req.body;
    try {
        const gallery = new Gallery({ title, url });
        await gallery.save();
        res.status(201).json({ error: false, message: "Gallery added successfully" });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
}

module.exports = {
    getGallery,
    addGallery,
    getGalleryWithPagination
};