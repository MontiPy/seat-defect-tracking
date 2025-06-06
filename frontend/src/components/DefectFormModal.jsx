// frontend/src/components/DefectFormModal.jsx

import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import api from "../services/api";

export default function DefectFormModal({
  initialPosition, // {x,y} from map click
  initialZoneId, // auto-detcted zone id
  zonesUrl, // e.g. "/images/1/zones"
  onSave, // callback({ zone_id, cbu, part_id, build_event_id, noted_by })
  partId,
  partName,
  partNumber,
}) {
  // state for metadata
  const [zones, setZones] = useState([]);
  const [buildEvents, setBuildEvents] = useState([]);
  const [defectTypes, setDefectTypes] = useState([]);

  // form fields
  const [zoneId, setZoneId] = useState(initialZoneId || ""); // default to provided zone or empty
  const [cbu, setCbu] = useState("");
  const [buildEventId, setBuildEventId] = useState("");
  const [defectTypeId, setDefectTypeId] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [preview, setPreview] = useState(null);

  // Fetch zones when zonesUrl changes
  useEffect(() => {
    if (!zonesUrl) return;
    api
      .get(zonesUrl)
      .then((res) => {
        // parse polygon_coords if needed, but here we only need id/name
        setZones(res.data);
        // initialize dropdown to first zone
        // if (!initialZoneId && res.data.length) {setZoneId(res.data[0].id);}
        if (!initialZoneId) {
          setZoneId("");
        }
      })
      .catch(console.error);
  }, [zonesUrl, initialZoneId]);

  // Update dropdown when auto-detected zone changes
  useEffect(() => {
    if (initialZoneId) {
      setZoneId(initialZoneId);
    }
  }, [initialZoneId]);

  // Fetch parts & build events once
  useEffect(() => {
    api
      .get("/build-events")
      .then((r) => setBuildEvents(r.data))
      .catch(console.error);
    api
      .get("/defect-types")
      .then((r) => setDefectTypes(r.data))
      .catch(console.error);
  }, []);

  const onDrop = async (files) => {
    if (!files.length) return;
    const form = new FormData();
    form.append("photo", files[0]);
    try {
      const res = await api.post("/defects/photo", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhotoUrl(res.data.url);
      setPreview(URL.createObjectURL(files[0]));
    } catch (err) {
      console.error(err);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      zone_id: zoneId,
      cbu,
      part_id: partId,
      build_event_id: buildEventId,
      defect_type_id: defectTypeId,
      photo_url: photoUrl,
    });

    setZoneId("")
    setCbu("");
    setBuildEventId("");
    setDefectTypeId("");
    setPhotoUrl("");
    setPreview(null);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Typography variant="h6">Enter Defect</Typography>
      <Typography variant="body2">
        Position: ({Math.round(initialPosition.x)},{" "}
        {Math.round(initialPosition.y)})
      </Typography>

      {/* Zone dropdown */}
      <FormControl fullWidth size="small">
        <InputLabel id="zone-label">Zone</InputLabel>
        <Select
          labelId="zone-label"
          value={zoneId}
          label="Zone"
          onChange={(e) => setZoneId(e.target.value)}
          required
        >
          {zones.map((z) => (
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
        onChange={(e) => setCbu(e.target.value)}
        size="small"
        required
      />

      {/* Part Number */}
      <TextField
        label="Part Number"
        value={
          partNumber && partName
            ? `${partNumber} - ${partName}`
            : partNumber || partName || ""}
        InputProps={{ readOnly: true }}
        size="small"
        // required
      />

      {/* Build Event */}
      <FormControl fullWidth size="small">
        <InputLabel id="event-label">Build Event</InputLabel>
        <Select
          labelId="event-label"
          value={buildEventId}
          label="Build Event"
          onChange={(e) => setBuildEventId(e.target.value)}
          required
        >
          {buildEvents.map((ev) => (
            <MenuItem key={ev.id} value={ev.id}>
              {ev.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Defect Type */}
      <FormControl fullWidth size="small">
        <InputLabel id="defect-type-label">Defect Type</InputLabel>
        <Select
          labelId="defect-type-label"
          value={defectTypeId}
          label="Defect Type"
          onChange={(e) => setDefectTypeId(e.target.value)}
          required
        >
          {defectTypes.map((dt) => (
            <MenuItem key={dt.id} value={dt.id}>
              {dt.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Photo upload */}
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed grey',
          p: 2,
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        <input {...getInputProps()} />
        {preview ? (
          <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: 100 }} />
        ) : (
          <Typography variant="body2">
            {isDragActive ? 'Drop the photo here…' : 'Drag & drop photo or click'}
          </Typography>
        )}
      </Box>

      {/* Save button */}
      <Button type="submit" variant="contained">
        Save Defect
      </Button>
    </Box>
  );
}
