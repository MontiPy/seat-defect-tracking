// frontend/src/components/DefectFormModal.jsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import api from '../services/api';

export default function DefectFormModal({
  initialPosition,   // {x,y} from map click
  zonesUrl,          // e.g. "/images/1/zones"
  onSave,            // callback({ zone_id, cbu, part_id, build_event_id, noted_by })
}) {
  // state for metadata
  const [zones, setZones]             = useState([]);
  const [parts, setParts]             = useState([]);
  const [buildEvents, setBuildEvents] = useState([]);

  // form fields
  const [zoneId, setZoneId]               = useState('');
  const [cbu, setCbu]                     = useState('');
  const [partId, setPartId]               = useState('');
  const [buildEventId, setBuildEventId]   = useState('');
  const [notedBy, setNotedBy]             = useState('');

  // 1️⃣ Fetch zones when zonesUrl changes
  useEffect(() => {
    if (!zonesUrl) return;
    api.get(zonesUrl)
      .then(res => {
        // parse polygon_coords if needed, but here we only need id/name
        setZones(res.data);
        // initialize dropdown to first zone
        if (res.data.length) setZoneId(res.data[0].id);
      })
      .catch(console.error);
  }, [zonesUrl]);

  // 2️⃣ Fetch parts & build events once
  useEffect(() => {
    api.get('/parts').then(r => setParts(r.data)).catch(console.error);
    api.get('/build-events').then(r => setBuildEvents(r.data)).catch(console.error);
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    onSave({
      zone_id:        zoneId,
      cbu,
      part_id:        partId,
      build_event_id: buildEventId,
      noted_by:       notedBy,
    });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Typography variant="h6">Enter Defect</Typography>
      <Typography variant="body2">
        Position: ({Math.round(initialPosition.x)}, {Math.round(initialPosition.y)})
      </Typography>

      {/* Zone dropdown */}
      <FormControl fullWidth size="small">
        <InputLabel id="zone-label">Zone</InputLabel>
        <Select
          labelId="zone-label"
          value={zoneId}
          label="Zone"
          onChange={e => setZoneId(e.target.value)}
          required
        >
          {zones.map(z => (
            <MenuItem key={z.id} value={z.id}>
              {z.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* CBU */}
      <TextField
        label="CBU"
        value={cbu}
        onChange={e => setCbu(e.target.value)}
        size="small"
        required
      />

      {/* Part Number */}
      <FormControl fullWidth size="small">
        <InputLabel id="part-label">Part Number</InputLabel>
        <Select
          labelId="part-label"
          value={partId}
          label="Part Number"
          onChange={e => setPartId(e.target.value)}
          required
        >
          {parts.map(p => (
            <MenuItem key={p.id} value={p.id}>
              {p.seat_part_number}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Build Event */}
      <FormControl fullWidth size="small">
        <InputLabel id="event-label">Build Event</InputLabel>
        <Select
          labelId="event-label"
          value={buildEventId}
          label="Build Event"
          onChange={e => setBuildEventId(e.target.value)}
          required
        >
          {buildEvents.map(ev => (
            <MenuItem key={ev.id} value={ev.id}>
              {ev.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Noted By */}
      <TextField
        label="Noted By"
        value={notedBy}
        onChange={e => setNotedBy(e.target.value)}
        size="small"
        required
      />

      {/* Save button */}
      <Button type="submit" variant="contained">
        Save Defect
      </Button>
    </Box>
  );
}
