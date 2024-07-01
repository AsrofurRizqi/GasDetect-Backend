const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// rename file and rezise image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/profile');
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        const filename = `${uuidv4()}.${ext}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            return cb(null, true);
        }
        return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    },
    limits: {
        fileSize: 1024 * 1024 * 2
    }
});

const singleUpload = (req, res, next) => {
    upload.single('profile_image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                 status: 400,
                 message: err.message 
                });
        }
        next();
    });
}

module.exports = { singleUpload };

