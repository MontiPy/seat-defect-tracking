// backend/src/routes/issues.js

const express = require('express');
const router = express.Router();
const {
  listIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  addComment,
  linkDefect,
  unlinkDefect,
  getIssueStats,
} = require('../controllers/issues');

// GET    /api/issues               → list all issues (with filtering)
// GET    /api/issues/stats         → get issue statistics
// GET    /api/issues/:id           → get one issue by its ID with related data
// POST   /api/issues               → create a new issue
// PUT    /api/issues/:id           → update an existing issue
// DELETE /api/issues/:id           → delete an issue

// POST   /api/issues/:id/comments  → add comment to issue
// POST   /api/issues/:id/defects   → link defect to issue
// DELETE /api/issues/:id/defects/:defectId → unlink defect from issue

// Statistics endpoint (should come before :id route)
router.get('/stats', getIssueStats);

// Main CRUD routes
router.get('/', listIssues);
router.get('/:id', getIssueById);
router.post('/', createIssue);
router.put('/:id', updateIssue);
router.delete('/:id', deleteIssue);

// Comments routes
router.post('/:id/comments', addComment);

// Defect relation routes
router.post('/:id/defects', linkDefect);
router.delete('/:id/defects/:defectId', unlinkDefect);

module.exports = router;
