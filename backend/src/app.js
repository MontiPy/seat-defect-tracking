// Load .env variables from backend/.env into process.env
require('dotenv').config();

const path    = require('path');
const express = require('express');
const cors    = require('cors');

// Import your route modules
const imageRoutes    = require('./routes/images');
const zoneRoutes     = require('./routes/zones');
const defectRoutes   = require('./routes/defects');
const partRoutes     = require('./routes/parts');
const eventRoutes    = require('./routes/buildEvents');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────

// Enable CORS for all origins (adjust in production!)
app.use(cors());

// Parse incoming JSON bodies up to a reasonable limit
app.use(express.json({ limit: '10mb' }));

// Serve uploaded images/statics under /uploads
app.use(
  '/uploads',
  express.static(path.resolve(__dirname, '../uploads'))
);

// ─── Mount API Routes ───────────────────────────────────────────────────────────

// Image management (upload, retrieve file URLs, etc.)
app.use('/api/images', imageRoutes);

// Zone definitions for each image
app.use('/api/zones', zoneRoutes);

// Defect logging (create, list, filter)
app.use('/api/defects', defectRoutes);

// Parts metadata (seat part numbers)
app.use('/api/parts', partRoutes);

// Build events metadata
app.use('/api/build-events', eventRoutes);

// ─── Error Handling Middleware ────────────────────────────────────────────────

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// General error handler
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

// ─── Start Server ──────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
