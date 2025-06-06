// backend/src/routes/defectTypes.js

const express = require('express');
const router  = express.Router();
const {
  listDefectTypes,
  getDefectTypeById,
  createDefectType,
  updateDefectType,
  deleteDefectType,
} = require('../controllers/defectTypes.js');

// GET    /api/defect-types        → list all defect typess
// GET    /api/defect-types/:id    → get one defect types by its ID
// POST   /api/defect-types        → create a new defect types
// PUT    /api/defect-types/:id    → update an existing defect types
// DELETE /api/defect-types/:id    → delete a defect types

router.get('/', listDefectTypes);
router.get('/:id', getDefectTypeById);
router.post('/', createDefectType);
router.put('/:id', updateDefectType);
router.delete('/:id', deleteDefectType);

module.exports = router;