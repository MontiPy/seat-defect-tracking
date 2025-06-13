// backend/src/controllers/images.js

const knex = require("../db/knex");
const path = require("path");

/**
 * GET /api/images/:id/zones
 */
async function getZones(req, res, next) {
  try {
    const imageId = req.params.id;
    const zones = await knex("zones").where("image_id", imageId);
    res.json(zones);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/images/:id/defects
 */
async function getDefects(req, res, next) {
  try {
    const imageId = req.params.id;
    const defects = await knex("defects").where("image_id", imageId);
    res.json(defects);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/images
 * Body: multipart/form-data with 'image' file and optional project_id, part_id
 */
async function createImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const { project_id, part_id } = req.body;

    const url = `/uploads/${req.file.filename}`;
    const [img] = await knex("images")
      .insert({
        filename: req.file.originalname,
        url,
        project_id,
        part_id,
      })
      .returning("*");
    res.status(201).json(img);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/images/:id/file?project_id
 */
async function uploadFile(req, res, next) {
  try {
    const imageId = req.params.id;
    const project_id = req.query.project_id;
    const part_id = req.body.part_id;
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Build the URL and update or insert into images table
    const url = `/uploads/${req.file.filename}`;

    const updateObj = {
      filename: req.file.originalname,
      url,
    };
    if (project_id) updateObj.project_id = project_id;
    if (part_id) updateObj.part_id = part_id;

    const updated = await knex("images")
      .where("id", imageId)
      .update(updateObj)
      .returning("*");

    let image;
    if (updated.length) {
      image = updated[0];
    } else {
      const [newImage] = await knex("images")
        .insert({ id: imageId, ...updateObj })
        .returning("*");
      image = newImage;
    }

    res.status(201).json(image);
  } catch (err) {
    next(err);
  }
}

// GET /api/images?project_id=#
async function listImages(req, res, next) {
  try {
    const { project_id } = req.query;
    let query = knex("images").select("id", "filename", "url", "project_id");
    if (project_id) {
      query = query.where("project_id", project_id);
    }
    const imgs = await query;
    res.json(imgs);
  } catch (err) {
    next(err);
  }
}

// GET /api/images/:id
async function getImageById(req, res, next) {
  try {
    const [img] = await knex("images")
      .leftJoin("projects", "images.project_id", "projects.id")
      .leftJoin("parts", "images.part_id", "parts.id")
      .where("images.id", req.params.id)
      .select(
        "images.id",
        "images.filename",
        "images.url",
        "images.project_id",
        "projects.name as project_name",
        "images.part_id",
        "parts.seat_part_number as part_number",
        "parts.description as part_name"
      );
    if (!img) return res.status(404).json({ error: "Not found" });
    res.json(img);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listImages,
  getImageById,
  getZones,
  getDefects,
  createImage,
  uploadFile,
};
