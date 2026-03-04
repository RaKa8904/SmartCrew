const express = require('express');
const multer = require('multer');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { uploadCrewCSV, uploadFlightCSV } = require('../controllers/adminController');

const router = express.Router();

// Multer config for CSV uploads, limiting file size to 2MB
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only .csv files are allowed!'), false);
        }
    }
});

// The route expects `upload.single('file')`
router.post(
    '/upload-crew-csv',
    authMiddleware,
    roleMiddleware(['admin']),
    upload.single('file'),
    uploadCrewCSV
);


router.post(
    '/upload-flight-csv',
    authMiddleware,
    roleMiddleware(['admin']),
    upload.single('file'),
    uploadFlightCSV
);

module.exports = router;
