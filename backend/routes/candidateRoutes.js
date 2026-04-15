const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');

const { submitCandidate, getAllCandidates } = require('../controllers/candidateController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  if (extName) {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDFs are allowed'));
  }
};

const upload = multer({ storage, fileFilter });

router.post('/submit', upload.array('files'), submitCandidate);
router.get('/all',     getAllCandidates);

module.exports = router;