const express = require("express")
const router = express.Router()
const cors = require("cors")
const uploadPhoto = require("../middlewares/upload")
const { getItem, addItem, updateItem, deleteItem } = require("../controllers/itemsController")
const { getGallery, addGallery, getGalleryWithPagination } = require("../controllers/galleryController")

router.get('/', cors(), getItem) 

/* The post request must have a body elemnt with name images */
router.post('/', uploadPhoto.array('images'), addItem)

router.get('/gallery', getGallery)

router.get('/gallery/pagination', getGalleryWithPagination)

router.post('/gallery', addGallery)

router.put('/:id', updateItem)

router.delete('/:id', deleteItem)

module.exports = router