const express = require('express');
const multer = require('multer');
const path = require('path');

const { protect } = require('../middleware/authMiddleware');

const {
  createApplication,
  getAllApplications,
  updateApplication,
  deleteApplication,
  downloadResume,
} = require('../controllers/applicationController');

const router = express.Router();

const allowedExtensions = new Set(['.pdf', '.doc', '.docx']);
const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const validExtension = allowedExtensions.has(extension);
    const validMime = allowedMimeTypes.has(file.mimetype);

    // Some browsers/OS combinations send an unusual MIME type for DOC/DOCX.
    // The extension is therefore also accepted, while the controller performs
    // the final validation before saving the file.
    if (validExtension || validMime) {
      return cb(null, true);
    }

    return cb(
      new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'resume')
    );
  },
});

const handleResumeUpload = (req, res, next) => {
  upload.single('resume')(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Resume must be 5 MB or smaller.',
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Please upload a valid PDF, DOC, or DOCX resume.',
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Resume upload failed.',
    });
  });
};

router.post('/apply', protect, handleResumeUpload, createApplication);
router.get('/applications', protect, getAllApplications);
router.get('/applications/:id/resume', protect, downloadResume);
router.put('/applications/:id', protect, updateApplication);
router.delete('/applications/:id', protect, deleteApplication);

module.exports = router;
