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
 * POST /api/images/:id/file
 */
async function uploadFile(req, res, next) {
  try {
    const imageId = req.params.id;
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Build the URL and update or insert into images table
    const url = `/uploads/${req.file.filename}`;
    const updated = await knex("images")
      .where("id", imageId)
      .update({ filename: req.file.originalname, url })
      .returning("*");

    let image;
    if (updated.length) {
      image = updated[0];
    } else {
      const [newImage] = await knex("images")
        .insert({ id: imageId, filename: req.file.originalname, url })
        .returning("*");
      image = newImage;
    }

    res.status(201).json(image);
  } catch (err) {
    next(err);
  }
}

// GET /api/images
async function listImages(req, res, next) {
  try {
    const imgs = await knex("images").select("id", "filename", "url");
    res.json(imgs);
  } catch (err) {
    next(err);
  }
}

// GET /api/images/:id
async function getImageById(req, res, next) {
  try {
    const [img] = await knex("images")
      .where("id", req.params.id)
      .select("id", "filename", "url");
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
  uploadFile,
};
