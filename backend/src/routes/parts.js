// backend/src/routes/parts.js

const express = require('express');
const router  = express.Router();
const {
  listParts,
  getPartById,
  createPart,
  updatePart,
  deletePart,
} = require('../controllers/parts');

// GET    /api/parts        → list all parts
// GET    /api/parts/:id    → get one part by its ID
// POST   /api/parts        → create a new part
// PUT    /api/parts/:id    → update an existing part
// DELETE /api/parts/:id    → delete a part

router.get('/', listParts);
router.get('/:id', getPartById);
router.post('/', createPart);
router.put('/:id', updatePart);
router.delete('/:id', deletePart);

module.exports = router;
