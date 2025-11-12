// sebastian



const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();


/*
    This is to ensure that the file type matches either one of 3
    image files.
*/

const imageFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
        return cb(new Error("Only images are allowed (jpg, jpeg, png)"));
    }
    cb(null, true);
};

const registrationFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".pdf" && ext !== ".jpeg" && 
        ext !== ".png" && ext !== ".jpg") {
        return cb(new Error("Only images are allowed of type (jpg, jpeg, png)"));
    }
    cb(null, true);
};

const upload = multer({
    storage,
    imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2mb
});

const uploadRegistration = multer({
    storage,
    registrationFilter,
    limits: {fileSize: 2 * 1024 * 1024}, // 2mb
})


module.exports = {
    upload,
    uploadRegistration,
};
