const express = require('express');
const router  = express.Router();
const { listZones, createZone, updateZone, deleteZone } = require('../controllers/zones');

// GET  /api/zones               → list all zones (optionally filter by image_id via query string)
// POST /api/zones              → create a new zone
// PUT  /api/zones/:zoneId      → update an existing zone
// DELETE /api/zones/:zoneId    → remove a zone

router.get('/', listZones);
router.post('/', createZone);
router.put('/:zoneId', updateZone);
router.delete('/:zoneId', deleteZone);

module.exports = router;
