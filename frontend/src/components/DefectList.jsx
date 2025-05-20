import React, { useState, useEffect } from 'react';
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, TableContainer, Typography
} from '@mui/material';
import api from '../services/api';

export default function DefectList({ imageId }) {
  const [defects, setDefects] = useState([]);

  useEffect(() => {
    if (!imageId) return;
    api.get('/defects', { params: { image_id: imageId } })
       .then(res => setDefects(res.data))
       .catch(console.error);
  }, [imageId]);

  if (!imageId) {
    return <Typography variant="body2">Select an image to view its defects.</Typography>;
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 300 }}>
      <Typography variant="h6" sx={{ p: 1 }}>Logged Defects</Typography>
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
          {defects.map(d => (
            <TableRow key={d.id}>
              <TableCell>{d.id}</TableCell>
              <TableCell>{d.zone_id}</TableCell>
              <TableCell>{d.cbu}</TableCell>
              <TableCell>{d.part_id}</TableCell>
              <TableCell>{d.build_event_id}</TableCell>
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
