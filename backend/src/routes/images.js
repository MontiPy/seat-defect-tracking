// backend/src/routes/images.js
const router = require('express').Router();
const { getZones, getDefects } = require('../controllers/images');

router.get('/:id/zones', getZones);
router.get('/:id/defects', getDefects);
// Later: POST /api/images/:id/zones to create zones, upload endpoints, etc.

module.exports = router;
