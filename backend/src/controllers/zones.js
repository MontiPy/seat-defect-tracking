const knex = require('../db/knex');

/**
 * List zones, optionally filtering by image_id query parameter
 * GET /api/zones?image_id=123
 */
async function listZones(req, res, next) {
  try {
    const q = knex('zones');
    if (req.query.image_id) {
      q.where('image_id', req.query.image_id);
    }
    const zones = await q;
    res.json(zones);
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new zone
 * POST /api/zones
 * body: { image_id, name, polygon_coords }
 */
async function createZone(req, res, next) {
  try {
    const [zone] = await knex('zones')
      .insert({
        image_id:      req.body.image_id,
        name:          req.body.name,
        polygon_coords: JSON.stringify(req.body.polygon_coords),
      })
      .returning('*');
    res.status(201).json(zone);
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing zone
 * PUT /api/zones/:zoneId
 */
async function updateZone(req, res, next) {
  try {
    const [zone] = await knex('zones')
      .where('id', req.params.zoneId)
      .update({
        name:           req.body.name,
        polygon_coords: JSON.stringify(req.body.polygon_coords),
      })
      .returning('*');
    res.json(zone);
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a zone
 * DELETE /api/zones/:zoneId
 */
async function deleteZone(req, res, next) {
  try {
    await knex('zones').where('id', req.params.zoneId).del();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listZones,
  createZone,
  updateZone,
  deleteZone,
};
