// backend/src/routes/defects.js

const express = require('express');
const multer  = require('multer');
const path    = require('path');
const router  = express.Router();
const {
  listDefects,
  getDefectById,
  createDefect,
  updateDefect,
  deleteDefect,
  uploadPhoto,
} = require('../controllers/defects');

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.resolve(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `defect-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// GET  /api/defects             → list all defects (filter via query: ?image_id=, ?zone_id=, etc.)
// GET  /api/defects/:id         → get one defect by its ID
// POST /api/defects             → create a new defect
// PUT  /api/defects/:id         → update an existing defect
// DELETE /api/defects/:id       → delete a defect

router.get('/', listDefects);
router.get('/:id', getDefectById);
router.post('/', createDefect);
router.post('/photo', upload.single('photo'), uploadPhoto);
router.put('/:id', updateDefect);
router.delete('/:id', deleteDefect);

module.exports = router;
