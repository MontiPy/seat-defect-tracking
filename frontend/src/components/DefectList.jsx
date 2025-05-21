import React, { useState, useEffect } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
  Typography,
} from "@mui/material";
import api from "../services/api";

export default function DefectList({ imageId, refreshKey }) {
  const [defects, setDefects] = useState([]);
  const [zones, setZones] = useState([]);
  const [parts, setParts] = useState([]);
  const [buildEvents, setBuildEvents] = useState([]);

  // Fetch defects whenever imageId or refreshKey changes
  useEffect(() => {
    if (!imageId) return;
    api
      .get("/defects", { params: { image_id: imageId } })
      .then((res) => setDefects(res.data))
      .catch(console.error);
  }, [imageId, refreshKey]);

  // Fetch metadata once
  useEffect(() => {
    if (!imageId) return;
    api
      .get(`/images/${imageId}/zones`)
      .then((res) => {
        const parsed = res.data.map((z) => ({
          ...z,
          polygon_coords:
            typeof z.polygon_coords === "string"
              ? JSON.parse(z.polygon_coords)
              : z.polygon_coords,
        }));
        setZones(parsed);
      })
      .catch(console.error);
    api
      .get("/parts")
      .then((res) => setParts(res.data))
      .catch(console.error);
    api
      .get("/build-events")
      .then((res) => setBuildEvents(res.data))
      .catch(console.error);
  }, [imageId]);

  const lookup = (arr, id, field) => {
    const item = arr.find((x) => x.id === id);
    return item ? item[field] : id;
  };

  if (!imageId) {
    return (
      <Typography variant="body2">
        Select an image to view its defects.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 300 }}>
      <Typography variant="h6" sx={{ p: 1 }}>
        Logged Defects
      </Typography>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Zone</TableCell>
            <TableCell>CBU</TableCell>
            <TableCell>Part #</TableCell>
            <TableCell>Build Event</TableCell>
            <TableCell>Noted By</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {defects.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{d.id}</TableCell>
              <TableCell>{lookup(zones, d.zone_id, 'name')}</TableCell>
              <TableCell>{d.cbu}</TableCell>
              <TableCell>{lookup(parts, d.part_id, 'seat_part_number')}</TableCell>
              <TableCell>{lookup(buildEvents, d.build_event_id, 'name')}</TableCell>
              <TableCell>{d.noted_by}</TableCell>
            </TableRow>
          ))}
          {defects.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No defects logged yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
