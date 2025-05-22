// backend/src/routes/projects.js

const express = require('express');
const router  = express.Router();
const {
  listprojects,
  getprojectById,
  createproject,
  updateproject,
  deleteproject,
} = require('../controllers/projects');

// GET    /api/projects        → list all projects
// GET    /api/projects/:id    → get one project by its ID
// POST   /api/projects        → create a new project
// PUT    /api/projects/:id    → update an existing project
// DELETE /api/projects/:id    → delete a project

router.get('/', listprojects);
router.get('/:id', getprojectById);
router.post('/', createproject);
router.put('/:id', updateproject);
router.delete('/:id', deleteproject);

module.exports = router;
