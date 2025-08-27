// backend/src/controllers/buildEvents.js

const knex = require('../db/knex');
const { success, error } = require('../utils/response');

/**
 * List all build events (optionally filtered by project)
 * GET /api/build-events?project_id=...
 */
async function listBuildEvents(req, res, next) {
  try {
    let query = knex('build_events as be')
      .leftJoin('projects as p', 'be.project_id', 'p.id')
      .select('be.*', 'p.name as project_name');

    // Filter by project if specified
    if (req.query.project_id) {
      query = query.where('be.project_id', req.query.project_id);
    }

    const events = await query.orderBy('be.date', 'desc');
    res.json(success(events, 'Build events retrieved successfully'));
  } catch (err) {
    next(err);
  }
}

/**
 * Get one build event by ID with project info
 * GET /api/build-events/:id
 */
async function getBuildEventById(req, res, next) {
  try {
    const event = await knex('build_events as be')
      .leftJoin('projects as p', 'be.project_id', 'p.id')
      .select('be.*', 'p.name as project_name')
      .where('be.id', req.params.id)
      .first();

    if (!event)
      return res.status(404).json(error('Build event not found', 404));
    res.json(success(event, 'Build event retrieved successfully'));
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new build event
 * POST /api/build-events
 * body: { name, date, project_id }
 */
async function createBuildEvent(req, res, next) {
  try {
    const { name, date, project_id } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json(error('Event name is required', 400));
    }
    if (!date) {
      return res.status(400).json(error('Event date is required', 400));
    }
    if (!project_id) {
      return res.status(400).json(error('Project ID is required', 400));
    }

    // Verify project exists
    const project = await knex('projects').where('id', project_id).first();
    if (!project) {
      return res.status(400).json(error('Invalid project ID', 400));
    }

    const payload = {
      name,
      date,
      project_id,
    };

    const [newEvent] = await knex('build_events')
      .insert(payload)
      .returning('*');
    res.status(201).json(success(newEvent, 'Build event created successfully'));
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing build event
 * PUT /api/build-events/:id
 */
async function updateBuildEvent(req, res, next) {
  try {
    const { name, date, project_id } = req.body;

    // Build updates object, removing undefined values
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (date !== undefined) updates.date = date;
    if (project_id !== undefined) {
      // Verify project exists if updating project_id
      const project = await knex('projects').where('id', project_id).first();
      if (!project) {
        return res.status(400).json(error('Invalid project ID', 400));
      }
      updates.project_id = project_id;
    }

    const [updated] = await knex('build_events')
      .where('id', req.params.id)
      .update(updates)
      .returning('*');

    if (!updated) {
      return res.status(404).json(error('Build event not found', 404));
    }

    res.json(success(updated, 'Build event updated successfully'));
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a build event
 * DELETE /api/build-events/:id
 */
async function deleteBuildEvent(req, res, next) {
  try {
    const count = await knex('build_events').where('id', req.params.id).del();
    if (count === 0)
      return res.status(404).json(error('Build event not found', 404));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listBuildEvents,
  getBuildEventById,
  createBuildEvent,
  updateBuildEvent,
  deleteBuildEvent,
};
