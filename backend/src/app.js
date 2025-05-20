// backend/src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const imageRoutes = require('./routes/images');
const defectRoutes = require('./routes/defects');

const app = express();
app.use(cors(), express.json());

app.use('/api/images', imageRoutes);
app.use('/api/defects', defectRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
