// backend/src/controllers/defects.js

const knex = require('../db/knex');
const fs = require('fs/promises');
const path = require('path');

/**
 * List defects, with optional filtering by query params
 * GET /api/defects?image_id=...&zone_id=...&part_id=...
 */
async function listDefects(req, res, next) {
  try {
    const q = knex('defects');
    ['image_id', 'zone_id', 'part_id', 'build_event_id', 'defect_type_id'].forEach(field => {
      if (req.query[field]) {
        q.where(field, req.query[field]);
      }
    });
    const defects = await q;
    res.json(defects);
  } catch (err) {
    next(err);
  }
}

/**
 * Get one defect by ID
 * GET /api/defects/:id
 */
async function getDefectById(req, res, next) {
  try {
    const [defect] = await knex('defects')
      .where('id', req.params.id)
      .limit(1);
    if (!defect) return res.status(404).json({ error: 'Defect not found' });
    res.json(defect);
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new defect
 * POST /api/defects
 * body: { image_id, zone_id, x, y, cbu, part_id, build_event_id, defect_type_id }
 */
async function createDefect(req, res, next) {
  try {
    const payload = {
      image_id:       req.body.image_id,
      zone_id:        req.body.zone_id,
      x:              req.body.x,
      y:              req.body.y,
      cbu:            req.body.cbu,
      part_id:        req.body.part_id,
      build_event_id: req.body.build_event_id,
      defect_type_id: req.body.defect_type_id,
      photo_url:      req.body.photo_url,
    };
    const [newDefect] = await knex('defects')
      .insert(payload)
      .returning('*');
    res.status(201).json(newDefect);
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing defect
 * PUT /api/defects/:id
 */
async function updateDefect(req, res, next) {
  try {
    const updates = { ...req.body };
    const [updated] = await knex('defects')
      .where('id', req.params.id)
      .update(updates)
      .returning('*');
    if (!updated) return res.status(404).json({ error: 'Defect not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a defect
 * DELETE /api/defects/:id
 */
async function deleteDefect(req, res, next) {
  try {
    const [defect] = await knex('defects')
      .where('id', req.params.id)
      .select('photo_url');
      
    const count = await knex('defects').where('id', req.params.id).del();
    if (count === 0) return res.status(404).json({ error: 'Defect not found' });  
    
    if (defect && defect.photo_url) {
      const filePath = path.resolve(
        __dirname,
        '../../uploads/defects',
        path.basename(defect.photo_url)
      );
      try {
        await fs.unlink(filePath);
      } catch (e) {
        if (e.code !== 'ENOENT') console.error('Error removing file', e);
      }
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function uploadPhoto(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const url = `/uploads/defects/${req.file.filename}`;
    res.status(201).json({ url });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listDefects,
  getDefectById,
  createDefect,
  updateDefect,
  deleteDefect,
  uploadPhoto,
};
