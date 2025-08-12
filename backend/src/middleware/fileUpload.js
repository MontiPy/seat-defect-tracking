const multer = require('multer');
const path = require('path');
const { logger } = require('../utils/logger');
const config = require('../utils/config');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads/defects'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `defect-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const fileExtension = path
    .extname(file.originalname)
    .toLowerCase()
    .substring(1);

  if (config.upload.allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    const error = new Error(
      `File type not allowed. Allowed types: ${config.upload.allowedTypes.join(', ')}`
    );
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize, // 10MB default
    files: 1,
  },
  fileFilter,
});

const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    logger.warn('File upload error', {
      requestId: req.requestId,
      error: error.message,
      code: error.code,
    });

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        details: `Maximum file size is ${config.upload.maxFileSize / 1024 / 1024}MB`,
      });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        details: 'Only one file allowed per upload',
      });
    }

    return res.status(400).json({
      success: false,
      error: 'File upload failed',
      details: error.message,
    });
  }

  if (error && error.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      details: error.message,
    });
  }

  next(error);
};

module.exports = {
  upload,
  handleUploadError,
};
