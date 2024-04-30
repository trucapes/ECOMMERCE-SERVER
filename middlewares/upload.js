/*
 * Middleware to upload images via multer
 */
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinationPath = `./public/undefined`;
    // console.log("Destination Path:", destinationPath);
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + "_" + file.originalname;
    // console.log("File Name:", fileName);
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
