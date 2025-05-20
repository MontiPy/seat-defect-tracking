// backend/src/routes/buildEvents.js

const express = require('express');
const router  = express.Router();
const {
  listBuildEvents,
  getBuildEventById,
  createBuildEvent,
  updateBuildEvent,
  deleteBuildEvent,
} = require('../controllers/buildEvents.js');

// GET    /api/build-events        → list all build events
// GET    /api/build-events/:id    → get one build event by its ID
// POST   /api/build-events        → create a new build event
// PUT    /api/build-events/:id    → update an existing build event
// DELETE /api/build-events/:id    → delete a build event

router.get('/', listBuildEvents);
router.get('/:id', getBuildEventById);
router.post('/', createBuildEvent);
router.put('/:id', updateBuildEvent);
router.delete('/:id', deleteBuildEvent);

module.exports = router;
