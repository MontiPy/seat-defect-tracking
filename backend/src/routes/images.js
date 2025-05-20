const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  listImages,
  getImageById,
  getZones,
  getDefects,
  uploadFile,
} = require("../controllers/images");

const router = express.Router();

// configure multer: store in uploads/, keep original extension
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.resolve(__dirname, "../../uploads")),
  filename: (req, file, cb) => {
    // e.g. image-<id>-<timestamp>.<ext>
    const ext = path.extname(file.originalname);
    cb(null, `image-${req.params.id}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// existing GETs
router.get("/", listImages);
router.get("/:id", getImageById);
router.get("/:id/zones", getZones);
router.get("/:id/defects", getDefects);

// NEW: upload image file for an image record
router.post("/:id/file", upload.single("image"), uploadFile);

module.exports = router;
