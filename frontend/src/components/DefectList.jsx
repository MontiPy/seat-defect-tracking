// src/components/DefectList.jsx

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
          paddingTop: 0,
          paddingBottom: 0,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: '#ffcdd2',
            color: '#222',
          },
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
          height: "36px",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 1,
        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          padding: 1,
          fontSize: "12px",
          "& .MuiInputBase-root": {
            height: "36px",
          },
        },
      },
    },
  },
});

export default function DefectList({
  imageId,
  projectId,
  refreshKey,
  showActions = true,
  highlightImageId,
  onDefectClick
}) {
  const [defects, setDefects] = useState([]);
  const [zonesMap, setZonesMap] = useState({});
  const [parts, setParts] = useState([]);
  const [buildEvents, setBuildEvents] = useState([]);
  const [defectTypes, setDefectTypes] = useState([]);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  // 1️⃣ Fetch defects by imageId or projectId
  useEffect(() => {
    const params = projectId
      ? { project_id: projectId }
      : imageId
      ? { image_id: imageId }
      : null;
    if (!params) return;

    api
      .get("/defects", { params })
      .then((res) => setDefects(res.data))
      .catch(console.error);
  }, [imageId, projectId, refreshKey]);

  // 2️⃣ Fetch parts & build events once
  useEffect(() => {
    api
      .get("/parts")
      .then((res) => setParts(res.data))
      .catch(console.error);

    api
      .get("/build-events")
      .then((res) => setBuildEvents(res.data))
      .catch(console.error);

    api
      .get("/defect-types")
      .then((res) => setDefectTypes(res.data))
      .catch(console.error);
  }, []);

  // 3️⃣ After defects load, fetch zones for each referenced image
  useEffect(() => {
    if (defects.length === 0) return;

    const uniqueImageIds = Array.from(
      new Set(defects.map((d) => d.image_id))
    );

    Promise.all(
      uniqueImageIds.map((id) =>
        api.get(`/images/${id}/zones`).then((res) => {
          const parsed = res.data.map((z) => ({
            ...z,
            polygon_coords:
              typeof z.polygon_coords === "string"
                ? JSON.parse(z.polygon_coords)
                : z.polygon_coords,
          }));
          return { imageId: id, zones: parsed };
        })
      )
    )
      .then((results) => {
        const map = {};
        results.forEach(({ imageId, zones }) => {
          map[imageId] = zones;
        });
        setZonesMap(map);
      })
      .catch(console.error);
  }, [defects]);

  const startEdit = (d) => {
    setEditingId(d.id);
    setEditValues({
      zone_id: d.zone_id,
      cbu: d.cbu,
      part_id: d.part_id,
      build_event_id: d.build_event_id,
      defect_type_id: d.defect_type_id,
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

  if (!imageId && !projectId) {
    return (
      <Typography variant="body2">
        Select an image to view its defects.
      </Typography>
    );
  }

  const colCount = showActions ? 8 : 7;

  return (
    <ThemeProvider theme={theme}>
      <TableContainer component={Paper} sx={{ mt: 2, maxHeight: '90%vh' }}>
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
              <TableCell sx={{ paddingLeft: 1 }}>ID</TableCell>
              <TableCell>Photo</TableCell>
              <TableCell>Zone</TableCell>
              <TableCell>CBU</TableCell>
              <TableCell>Part #</TableCell>
              <TableCell>Build Event</TableCell>
              <TableCell>Defect Type</TableCell>
              {showActions && <TableCell align="center">Actions</TableCell>}
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
              <TableRow 
              key={d.id}
              selected={d.image_id === highlightImageId}
              hover
              onClick={() => onDefectClick(d)}
              sx={{ cursor: 'pointer'}}
              >
                <TableCell sx={{ paddingLeft: 1 }}>{d.id}</TableCell>
                <TableCell>
                  {d.photo_url && (
                    <img
                      src={`${process.env.REACT_APP_API_URL}${d.photo_url}`}
                      alt="evidence"
                      style={{ width: 40 }}
                    />
                  )}
                </TableCell>

                {/* Zone name */}
                <TableCell>
                  {zonesMap[d.image_id]?.find((z) => z.id === d.zone_id)
                    ?.name || d.zone_id}
                </TableCell>

                {/* CBU */}
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

                {/* Part # */}
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
                    parts.find((p) => p.id === d.part_id)
                      ?.seat_part_number || d.part_id
                  )}
                </TableCell>

                {/* Build Event */}
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

                {/* Defect Type */}
                <TableCell>
                  {editingId === d.id ? (
                    <FormControl fullWidth>
                      <InputLabel id="defect-type-edit-label">Defect Type</InputLabel>
                      <Select
                        labelId="defect-type-edit-label"
                        value={editValues.defect_type_id}
                        label="Defect Type"
                        onChange={(e) =>
                          handleChange("defect_type_id", e.target.value)
                        }
                      >
                        {defectTypes.map((dt) => (
                          <MenuItem key={dt.id} value={dt.id}>
                            {dt.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    defectTypes.find((dt) => dt.id === d.defect_type_id)
                      ?.name || d.defect_type_id
                  )}
                </TableCell>

                {/* Actions */}
                {showActions && (
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
                )}
              </TableRow>
            ))}
            {defects.length === 0 && (
              <TableRow>
                <TableCell colSpan={colCount} align="center">
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
