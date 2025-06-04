// backend/src/controllers/DefectTypes.js

const knex = require('../db/knex');

/**
 * List all defect types
 * GET /api/defect-types
 */
async function listDefectTypes(req, res, next) {
  try {
    const events = await knex('defect_types').select('*');
    res.json(events);
  } catch (err) {
    next(err);
  }
}

/**
 * Get one defect type by ID
 * GET /api/defect-types/:id
 */
async function getDefectTypeById(req, res, next) {
  try {
    const [event] = await knex('defect_types')
      .where('id', req.params.id)
      .limit(1);
    if (!event) return res.status(404).json({ error: 'Defect type not found' });
    res.json(event);
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new defect type
 * POST /api/defect-types
 * body: { name, date, [other_metadata] }
 */
async function createDefectType(req, res, next) {
  try {
    const payload = {
      name: req.body.name,
      date: req.body.date,
      // include other_metadata fields here if needed
    };
    const [newEvent] = await knex('defect_types')
      .insert(payload)
      .returning('*');
    res.status(201).json(newEvent);
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing defect type
 * PUT /api/defect-types/:id
 */
async function updateDefectType(req, res, next) {
  try {
    const updates = {
      name: req.body.name,
      date: req.body.date,
      // other_metadata updates
    };
    const [updated] = await knex('defect_types')
      .where('id', req.params.id)
      .update(updates)
      .returning('*');
    if (!updated) return res.status(404).json({ error: 'Defect type not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a defect type
 * DELETE /api/defect-types/:id
 */
async function deleteDefectType(req, res, next) {
  try {
    const count = await knex('defect_types')
      .where('id', req.params.id)
      .del();
    if (count === 0) return res.status(404).json({ error: 'defect type not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listDefectTypes,
  getDefectTypeById,
  createDefectType,
  updateDefectType,
  deleteDefectType,
};
