// backend/src/routes/parts.js

const express = require('express');
const router = express.Router();
const {
  listParts,
  getPartById,
  createPart,
  updatePart,
  deletePart,
  linkImageToPart,
  unlinkImageFromPart,
} = require('../controllers/parts');

// GET    /api/parts                    → list all parts (with optional project_id filter)
// GET    /api/parts/:id                → get one part by its ID with images
// POST   /api/parts                    → create a new part
// PUT    /api/parts/:id                → update an existing part
// DELETE /api/parts/:id                → delete a part

// POST   /api/parts/:id/images         → link image to part
// DELETE /api/parts/:id/images/:imageId → unlink image from part

router.get('/', listParts);
router.get('/:id', getPartById);
router.post('/', createPart);
router.put('/:id', updatePart);
router.delete('/:id', deletePart);

// Image linking routes
router.post('/:id/images', linkImageToPart);
router.delete('/:id/images/:imageId', unlinkImageFromPart);

module.exports = router;
