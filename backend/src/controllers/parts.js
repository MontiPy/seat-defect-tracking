// backend/src/controllers/parts.js

const knex = require('../db/knex');
const { success, error } = require('../utils/response');

/**
 * List all parts (optionally filtered by project)
 * GET /api/parts?project_id=...
 */
async function listParts(req, res, next) {
  try {
    let query = knex('parts as p')
      .leftJoin('projects as proj', 'p.project_id', 'proj.id')
      .select('p.*', 'proj.name as project_name');

    // Filter by project if specified
    if (req.query.project_id) {
      query = query.where('p.project_id', req.query.project_id);
    }

    const parts = await query.orderBy('p.seat_part_number', 'asc');
    res.json(success(parts, 'Parts retrieved successfully'));
  } catch (err) {
    next(err);
  }
}

/**
 * Get one part by ID with project info and linked images
 * GET /api/parts/:id
 */
async function getPartById(req, res, next) {
  try {
    const part = await knex('parts as p')
      .leftJoin('projects as proj', 'p.project_id', 'proj.id')
      .select('p.*', 'proj.name as project_name')
      .where('p.id', req.params.id)
      .first();

    if (!part) {
      return res.status(404).json(error('Part not found', 404));
    }

    // Get linked images for this part
    const images = await knex('images')
      .where('part_id', req.params.id)
      .select('*')
      .orderBy('created_at', 'desc');

    const result = {
      ...part,
      images,
    };

    res.json(success(result, 'Part retrieved successfully'));
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new part
 * POST /api/parts
 * body: { seat_part_number, description, project_id }
 */
async function createPart(req, res, next) {
  try {
    const { seat_part_number, description, project_id } = req.body;

    // Validate required fields
    if (!seat_part_number) {
      return res.status(400).json(error('Seat part number is required', 400));
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
      seat_part_number,
      description,
      project_id,
    };

    const [newPart] = await knex('parts').insert(payload).returning('*');
    res.status(201).json(success(newPart, 'Part created successfully'));
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
    const { seat_part_number, description, project_id } = req.body;

    // Build updates object, removing undefined values
    const updates = {};
    if (seat_part_number !== undefined)
      updates.seat_part_number = seat_part_number;
    if (description !== undefined) updates.description = description;
    if (project_id !== undefined) {
      // Verify project exists if updating project_id
      const project = await knex('projects').where('id', project_id).first();
      if (!project) {
        return res.status(400).json(error('Invalid project ID', 400));
      }
      updates.project_id = project_id;
    }

    const [updated] = await knex('parts')
      .where('id', req.params.id)
      .update(updates)
      .returning('*');

    if (!updated) {
      return res.status(404).json(error('Part not found', 404));
    }

    res.json(success(updated, 'Part updated successfully'));
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
    const count = await knex('parts').where('id', req.params.id).del();
    if (count === 0) {
      return res.status(404).json(error('Part not found', 404));
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * Link an image to a part
 * POST /api/parts/:id/images
 */
async function linkImageToPart(req, res, next) {
  try {
    const { image_id } = req.body;
    const partId = req.params.id;

    if (!image_id) {
      return res.status(400).json(error('Image ID is required', 400));
    }

    // Verify part exists
    const part = await knex('parts').where('id', partId).first();
    if (!part) {
      return res.status(404).json(error('Part not found', 404));
    }

    // Verify image exists
    const image = await knex('images').where('id', image_id).first();
    if (!image) {
      return res.status(404).json(error('Image not found', 404));
    }

    // Link image to part
    await knex('images').where('id', image_id).update({ part_id: partId });

    res.json(success(null, 'Image linked to part successfully'));
  } catch (err) {
    next(err);
  }
}

/**
 * Unlink an image from a part
 * DELETE /api/parts/:id/images/:imageId
 */
async function unlinkImageFromPart(req, res, next) {
  try {
    const { id: partId, imageId } = req.params;

    // Verify the image is linked to this part
    const image = await knex('images')
      .where('id', imageId)
      .where('part_id', partId)
      .first();

    if (!image) {
      return res
        .status(404)
        .json(error('Image not found or not linked to this part', 404));
    }

    // Unlink image from part
    await knex('images').where('id', imageId).update({ part_id: null });

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
  linkImageToPart,
  unlinkImageFromPart,
};
