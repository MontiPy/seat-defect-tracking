// backend/src/controllers/DefectTypes.js

const knex = require('../db/knex');
const { success, error } = require('../utils/response');

/**
 * List all defect types
 * GET /api/defect-types
 */
async function listDefectTypes(req, res, next) {
  try {
    const events = await knex('defect_types').select('*');
    res.json(success(events, 'Defect types retrieved successfully'));
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
    if (!event)
      return res.status(404).json(error('Defect type not found', 404));
    res.json(success(event, 'Defect type retrieved successfully'));
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
      description: req.body.description,
    };
    const [newEvent] = await knex('defect_types')
      .insert(payload)
      .returning('*');
    res.status(201).json(success(newEvent, 'Defect type created successfully'));
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
      description: req.body.description,
    };
    const [updated] = await knex('defect_types')
      .where('id', req.params.id)
      .update(updates)
      .returning('*');
    if (!updated)
      return res.status(404).json(error('Defect type not found', 404));
    res.json(success(updated, 'Defect type updated successfully'));
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
    const count = await knex('defect_types').where('id', req.params.id).del();
    if (count === 0)
      return res.status(404).json(error('Defect type not found', 404));
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
