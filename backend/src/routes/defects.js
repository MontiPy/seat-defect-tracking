// backend/src/routes/defects.js

const express = require('express');
const router = express.Router();
const {
  listDefects,
  getDefectById,
  createDefect,
  updateDefect,
  deleteDefect,
  countByDefectType,
  uploadPhoto,
} = require('../controllers/defects');
const {
  validate,
  validateParams,
  schemas,
} = require('../middleware/validation');
const { upload, handleUploadError } = require('../middleware/fileUpload');

// GET  /api/defects             → list all defects (filter via query: ?image_id=, ?zone_id=, etc.)
// GET  /api/defects/:id         → get one defect by its ID
// POST /api/defects             → create a new defect
// PUT  /api/defects/:id         → update an existing defect
// DELETE /api/defects/:id       → delete a defect

router.get('/summary', countByDefectType);
router.get('/', listDefects);
router.get('/:id', validateParams(schemas.id), getDefectById);
router.post('/', validate(schemas.createDefect), createDefect);
router.post('/photo', upload.single('photo'), handleUploadError, uploadPhoto);
router.put(
  '/:id',
  validateParams(schemas.id),
  validate(schemas.updateDefect),
  updateDefect
);
router.delete('/:id', validateParams(schemas.id), deleteDefect);

module.exports = router;
