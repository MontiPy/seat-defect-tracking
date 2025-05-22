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
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, Delete, Save, Cancel } from "@mui/icons-material";
import api from "../services/api";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          paddingLeft: 2,
          paddingRight: 2,
          PaddingTop: 0,
          paddingBottom: 0,
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          padding: 1,
          size: "small",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          padding: 1,
          fontSize: "12px",
          height: "36px", // Adjust globally
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 1, // Adjust padding for a smaller button
          // Add other style adjustments as needed
        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        root: {
          fontSize: "1rem", // Adjust fontSize for a smaller icon
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          padding: 1,
          fontSize: "12px", // Adjust font size
          "& .MuiInputBase-root": {
            height: "36px", // Adjust height
          },
        },
      },
    },
  },
});

export default function DefectList({ imageId, refreshKey }) {
  const [defects, setDefects] = useState([]);
  const [zones, setZones] = useState([]);
  const [parts, setParts] = useState([]);
  const [buildEvents, setBuildEvents] = useState([]);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

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

  const startEdit = (d) => {
    setEditingId(d.id);
    setEditValues({
      zone_id: d.zone_id,
      cbu: d.cbu,
      part_id: d.part_id,
      build_event_id: d.build_event_id,
      noted_by: d.noted_by,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = (id) => {
    api
      .put(`/defects/${id}`, editValues)
      .then(() => {
        setEditingId(null);
        setEditValues({});
      })
      .catch(console.error);
  };

  const deleteDefect = (id) => {
    api
      .delete(`/defects/${id}`)
      .then(() => {
        setDefects((ds) => ds.filter((d) => d.id !== id));
      })
      .catch(console.error);
  };

  const handleChange = (field, value) => {
    setEditValues((ev) => ({ ...ev, [field]: value }));
  };

  // const lookup = (arr, id, field) => {
  //   const item = arr.find((x) => x.id === id);
  //   return item ? item[field] : id;
  // };

  if (!imageId) {
    return (
      <Typography variant="body2">
        Select an image to view its defects.
      </Typography>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 450 }}>
        <Typography variant="h6" sx={{ p: 1 }}>
          Logged Defects
        </Typography>
        <Table size="small" stickyHeader>
          <TableHead
            sx={{
              "& .MuiTableCell-root": {
                fontWeight: "bold",
              },
            }}
          >
            <TableRow>
              <TableCell sx={{paddingLeft: 1}}>ID</TableCell>
              <TableCell>Zone</TableCell>
              <TableCell>CBU</TableCell>
              <TableCell>Part #</TableCell>
              <TableCell>Build Event</TableCell>
              <TableCell>Noted By</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              "& .MuiTableCell-root": {
                fontSize: "12px",
              },
            }}
          >
            {defects.map((d) => (
              <TableRow key={d.id}>
                <TableCell sx={{paddingLeft: 1}}>{d.id}</TableCell>
                {/* Zone cell */}
                <TableCell>
                  {editingId === d.id ? (
                    <FormControl fullWidth>
                      <InputLabel id="zone-edit-label">Zone</InputLabel>
                      <Select
                        labelId="zone-edit-label"
                        value={editValues.zone_id}
                        label="Zone"
                        onChange={(e) =>
                          handleChange("zone_id", e.target.value)
                        }
                      >
                        {zones.map((z) => (
                          <MenuItem key={z.id} value={z.id}>
                            {z.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    zones.find((z) => z.id === d.zone_id)?.name || d.zone_id
                  )}
                </TableCell>
                {/* CBU cell */}
                <TableCell>
                  {editingId === d.id ? (
                    <TextField
                      value={editValues.cbu}
                      onChange={(e) => handleChange("cbu", e.target.value)}
                    />
                  ) : (
                    d.cbu
                  )}
                </TableCell>
                {/* Part cell */}
                <TableCell>
                  {editingId === d.id ? (
                    <FormControl fullWidth>
                      <InputLabel id="part-edit-label">Part</InputLabel>
                      <Select
                        labelId="part-edit-label"
                        value={editValues.part_id}
                        label="Part"
                        onChange={(e) =>
                          handleChange("part_id", e.target.value)
                        }
                      >
                        {parts.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.seat_part_number}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    parts.find((p) => p.id === d.part_id)?.seat_part_number ||
                    d.part_id
                  )}
                </TableCell>
                {/* Build Event cell */}
                <TableCell>
                  {editingId === d.id ? (
                    <FormControl fullWidth>
                      <InputLabel id="event-edit-label">Event</InputLabel>
                      <Select
                        labelId="event-edit-label"
                        value={editValues.build_event_id}
                        label="Event"
                        onChange={(e) =>
                          handleChange("build_event_id", e.target.value)
                        }
                      >
                        {buildEvents.map((ev) => (
                          <MenuItem key={ev.id} value={ev.id}>
                            {ev.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    buildEvents.find((ev) => ev.id === d.build_event_id)
                      ?.name || d.build_event_id
                  )}
                </TableCell>
                {/* Noted By cell */}
                <TableCell>
                  {editingId === d.id ? (
                    <TextField
                      value={editValues.noted_by}
                      onChange={(e) => handleChange("noted_by", e.target.value)}
                    />
                  ) : (
                    d.noted_by
                  )}
                </TableCell>
                {/* Actions */}
                <TableCell align="center">
                  {editingId === d.id ? (
                    <>
                      <IconButton onClick={() => saveEdit(d.id)}>
                        <Save />
                      </IconButton>
                      <IconButton onClick={cancelEdit}>
                        <Cancel />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton onClick={() => startEdit(d)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => deleteDefect(d.id)}>
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {defects.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No defects logged yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </ThemeProvider>
  );
}
