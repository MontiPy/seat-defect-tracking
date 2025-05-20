// backend/src/routes/defects.js

const express = require('express');
const router  = express.Router();
const {
  listDefects,
  getDefectById,
  createDefect,
  updateDefect,
  deleteDefect,
} = require('../controllers/defects');

// GET  /api/defects             → list all defects (filter via query: ?image_id=, ?zone_id=, etc.)
// GET  /api/defects/:id         → get one defect by its ID
// POST /api/defects             → create a new defect
// PUT  /api/defects/:id         → update an existing defect
// DELETE /api/defects/:id       → delete a defect

router.get('/', listDefects);
router.get('/:id', getDefectById);
router.post('/', createDefect);
router.put('/:id', updateDefect);
router.delete('/:id', deleteDefect);

module.exports = router;
