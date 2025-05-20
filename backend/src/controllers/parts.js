// backend/src/controllers/parts.js

const knex = require('../db/knex');

/**
 * List all parts
 * GET /api/parts
 */
async function listParts(req, res, next) {
  try {
    const parts = await knex('parts').select('*');
    res.json(parts);
  } catch (err) {
    next(err);
  }
}

/**
 * Get one part by ID
 * GET /api/parts/:id
 */
async function getPartById(req, res, next) {
  try {
    const [part] = await knex('parts')
      .where('id', req.params.id)
      .limit(1);
    if (!part) return res.status(404).json({ error: 'Part not found' });
    res.json(part);
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new part
 * POST /api/parts
 * body: { seat_part_number, description }
 */
async function createPart(req, res, next) {
  try {
    const payload = {
      seat_part_number: req.body.seat_part_number,
      description:      req.body.description,
    };
    const [newPart] = await knex('parts')
      .insert(payload)
      .returning('*');
    res.status(201).json(newPart);
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing part
 * PUT /api/parts/:id
 */
async function updatePart(req, res, next) {
  try {
    const updates = {
      seat_part_number: req.body.seat_part_number,
      description:      req.body.description,
    };
    const [updated] = await knex('parts')
      .where('id', req.params.id)
      .update(updates)
      .returning('*');
    if (!updated) return res.status(404).json({ error: 'Part not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a part
 * DELETE /api/parts/:id
 */
async function deletePart(req, res, next) {
  try {
    const count = await knex('parts')
      .where('id', req.params.id)
      .del();
    if (count === 0) return res.status(404).json({ error: 'Part not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listParts,
  getPartById,
  createPart,
  updatePart,
  deletePart,
};
