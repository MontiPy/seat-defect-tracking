// backend/src/controllers/projects.js

const knex = require('../db/knex');

/**
 * List all projects
 * GET /api/projects
 */
async function listprojects(req, res, next) {
  try {
    const projects = await knex('projects').select('*');
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

/**
 * Get one project by ID
 * GET /api/projects/:id
 */
async function getprojectById(req, res, next) {
  try {
    const [project] = await knex('projects')
      .where('id', req.params.id)
      .limit(1);
    if (!project) return res.status(404).json({ error: 'project not found' });
    res.json(project);
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new project
 * POST /api/projects
 * body: { project_number, description }
 */
async function createproject(req, res, next) {
  try {
    const payload = {
      project_number: req.body.project_number,
      description:      req.body.description,
    };
    const [newproject] = await knex('projects')
      .insert(payload)
      .returning('*');
    res.status(201).json(newproject);
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing project
 * PUT /api/projects/:id
 */
async function updateproject(req, res, next) {
  try {
    const updates = {
      project_number: req.body.project_number,
      description:      req.body.description,
    };
    const [updated] = await knex('projects')
      .where('id', req.params.id)
      .update(updates)
      .returning('*');
    if (!updated) return res.status(404).json({ error: 'project not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a project
 * DELETE /api/projects/:id
 */
async function deleteproject(req, res, next) {
  try {
    const count = await knex('projects')
      .where('id', req.params.id)
      .del();
    if (count === 0) return res.status(404).json({ error: 'project not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listprojects,
  getprojectById,
  createproject,
  updateproject,
  deleteproject,
};
