const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  listImages,
  getImageById,
  getZones,
  getDefects,
  createImage,
  uploadFile,
  deleteImage,
} = require("../controllers/images");

const router = express.Router();

// configure multer: store in uploads/defects, keep original extension
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.resolve(__dirname, "../../uploads/defects")),
  filename: (req, file, cb) => {
    // e.g. image-<id>-<timestamp>.<ext>
    const ext = path.extname(file.originalname);
    const idPart = req.params.id ? `${req.params.id}-` : "";
    cb(null, `image-${idPart}${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// existing GETs
// List all images, optionally filtered by project_id
router.get("/", listImages);
// Upload a new image and create record
router.post("/", upload.single("image"), createImage);
// Get image by ID
router.get("/:id", getImageById);
// Get zones for an image
router.get("/:id/zones", getZones);
// Get defects for an image
router.get("/:id/defects", getDefects);

// NEW: upload image file for an image record
router.post("/:id/file", upload.single("image"), uploadFile);
router.delete("/:id", deleteImage);

module.exports = router;
