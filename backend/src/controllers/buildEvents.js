// backend/src/controllers/buildEvents.js

const knex = require('../db/knex');
const { success, error } = require('../utils/response');

/**
 * List all build events
 * GET /api/build-events
 */
async function listBuildEvents(req, res, next) {
  try {
    const events = await knex('build_events').select('*');
    res.json(success(events, 'Build events retrieved successfully'));
  } catch (err) {
    next(err);
  }
}

/**
 * Get one build event by ID
 * GET /api/build-events/:id
 */
async function getBuildEventById(req, res, next) {
  try {
    const [event] = await knex('build_events')
      .where('id', req.params.id)
      .limit(1);
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
 * body: { name, date, [other_metadata] }
 */
async function createBuildEvent(req, res, next) {
  try {
    const payload = {
      name: req.body.name,
      date: req.body.date,
      // include other_metadata fields here if needed
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
    const updates = {
      name: req.body.name,
      date: req.body.date,
      // other_metadata updates
    };
    const [updated] = await knex('build_events')
      .where('id', req.params.id)
      .update(updates)
      .returning('*');
    if (!updated)
      return res.status(404).json(error('Build event not found', 404));
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
