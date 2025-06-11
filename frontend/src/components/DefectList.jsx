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
  Box,
  Button,
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
            backgroundColor: '#efedff',
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
  onDefectClick,
  onDefectHover,
  onDefectHoverOut,
}) {
  const [defects, setDefects] = useState([]);
  const [parts, setParts] = useState([]);
  const [buildEvents, setBuildEvents] = useState([]);
  const [defectTypes, setDefectTypes] = useState([]);
  const [zones, setZones] = useState([]);

  const [filters, setFilters] = useState({
    zone_id: "",
    cbu: "",
    part_id: "",
    build_event_id: "",
    defect_type_id: "",
  });

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  // 1️⃣ Fetch defects by imageId or projectId with filters
  useEffect(() => {
    const baseParams = imageId
      ? { image_id: imageId }
      : projectId
      ? { project_id: projectId }
      : null;
    if (!baseParams) return;

    const params = { ...baseParams };
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });

    api
      .get("/defects", { params })
      .then((res) => setDefects(res.data))
      .catch(console.error);
  }, [imageId, projectId, refreshKey, filters]);

  // 2️⃣ Fetch parts, zones & build events once
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

    api
      .get("/zones")
      .then((res) => setZones(res.data))
      .catch(console.error);
  }, []);


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

  const handleFilterChange = (field, value) => {
    setFilters((f) => ({ ...f, [field]: value }));
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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 1, pb: 1 }}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="zone-filter-label">Zone</InputLabel>
            <Select
              labelId="zone-filter-label"
              label="Zone"
              value={filters.zone_id}
              onChange={(e) => handleFilterChange('zone_id', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {zones.map((z) => (
                <MenuItem key={z.id} value={z.id}>
                  {z.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="CBU"
            size="small"
            value={filters.cbu}
            onChange={(e) => handleFilterChange('cbu', e.target.value)}
          />

          <FormControl sx={{ minWidth: 140 }} size="small">
            <InputLabel id="part-filter-label">Part</InputLabel>
            <Select
              labelId="part-filter-label"
              label="Part"
              value={filters.part_id}
              onChange={(e) => handleFilterChange('part_id', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {parts.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.seat_part_number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 140 }} size="small">
            <InputLabel id="event-filter-label">Build Event</InputLabel>
            <Select
              labelId="event-filter-label"
              label="Build Event"
              value={filters.build_event_id}
              onChange={(e) => handleFilterChange('build_event_id', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {buildEvents.map((ev) => (
                <MenuItem key={ev.id} value={ev.id}>
                  {ev.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 140 }} size="small">
            <InputLabel id="type-filter-label">Defect Type</InputLabel>
            <Select
              labelId="type-filter-label"
              label="Defect Type"
              value={filters.defect_type_id}
              onChange={(e) => handleFilterChange('defect_type_id', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {defectTypes.map((dt) => (
                <MenuItem key={dt.id} value={dt.id}>
                  {dt.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            size="small"
            onClick={() =>
              setFilters({ zone_id: '', cbu: '', part_id: '', build_event_id: '', defect_type_id: '' })
            }
          >
            Clear
          </Button>
        </Box>
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
              hover={!!onDefectClick}
              onClick={onDefectClick ? () => onDefectClick(d) : undefined}
              onMouseEnter={
                onDefectHover ? () => onDefectHover(d.id) : undefined
              }
              onMouseLeave={onDefectHoverOut || undefined}
              sx={{ cursor: onDefectClick ? 'pointer' : 'default' }}
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
                {d.zone_name || d.zone_id}
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
                    d.part_number ||
                    parts.find((p) => p.id === d.part_id)?.seat_part_number ||
                    d.part_id
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
                    d.build_event_name ||
                    buildEvents.find((ev) => ev.id === d.build_event_id)?.name ||
                    d.build_event_id
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
                    d.defect_type_name ||
                    defectTypes.find((dt) => dt.id === d.defect_type_id)?.name ||
                    d.defect_type_id
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
