import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  ListItemButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import api from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import { Stage, Layer, Line, Circle, Image as KonvaImage } from "react-konva";
import useImage from "use-image";

// Hook to track viewport size
function useWindowDimensions() {
  const [dims, setDims] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    const onResize = () =>
      setDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return dims;
}

export default function ZoneCreatorScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedProject = location.state?.project;
  const stageRef = useRef();

  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zonesMap, setZonesMap] = useState({});
  const [currentPoints, setCurrentPoints] = useState([]);
  const [zoneName, setZoneName] = useState("");
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [pointMode, setPointMode] = useState("add");

  // Load project images
  useEffect(() => {
    if (!selectedProject) return;
    api
      .get(`/images?project_id=${selectedProject}`)
      .then((res) => {
        setImages(res.data);
        if (res.data.length) setSelectedImage(res.data[0]);
      })
      .catch(console.error);
  }, [selectedProject]);

  // Fetch zones for image
  useEffect(() => {
    if (!selectedImage) return;
    api
      .get(`/images/${selectedImage.id}/zones`)
      .then((res) => {
        const parsed = res.data.map((z) => ({
          id: z.id,
          name: z.name,
          points: (typeof z.polygon_coords === "string"
            ? JSON.parse(z.polygon_coords)
            : z.polygon_coords
          ).flatMap((p) => [p.x, p.y]),
        }));
        setZonesMap((m) => ({ ...m, [selectedImage.id]: parsed }));
      })
      .catch(console.error);
  }, [selectedImage]);

  // Reset on image change
  useEffect(() => {
    setCurrentPoints([]);
    setZoneName("");
    setEditingZoneId(null);
  }, [selectedImage]);

  const zones = selectedImage ? zonesMap[selectedImage.id] || [] : [];
  const [img] = useImage(
    selectedImage
      ? `${process.env.REACT_APP_API_URL}${selectedImage.url}`
      : null
  );
  const { width: vw, height: vh } = useWindowDimensions();
  const scale =
    img && img.width
      ? Math.min((vw * 0.4) / img.width, (vh * 0.8) / img.height, 1)
      : 1;

  const handleImageSelect = (img) => setSelectedImage(img);

  const handleCanvasClick = (e) => {
    if (!selectedImage || pointMode === "delete") return;
    if (!editingZoneId && !zoneName.trim()) return;
    const stage = e.target.getStage();
    const { x, y } = stage.getPointerPosition();
    if (editingZoneId) {
      setZonesMap((m) => ({
        ...m,
        [selectedImage.id]: m[selectedImage.id].map((z) =>
          z.id === editingZoneId ? { ...z, points: [...z.points, x, y] } : z
        ),
      }));
    } else {
      setCurrentPoints((p) => [...p, x, y]);
    }
  };

  const startEditZone = (zone) => {
    setEditingZoneId(zone.id);
    setZoneName(zone.name);
    setCurrentPoints(zone.points);
  };

  const deletePoint = (zoneId, idx) => {
    if (pointMode !== "delete" || zoneId !== editingZoneId) return;
    setZonesMap((m) => ({
      ...m,
      [selectedImage.id]: m[selectedImage.id].map((z) => {
        if (z.id === zoneId) {
          const pts = [...z.points];
          pts.splice(idx * 2, 2);
          return { ...z, points: pts };
        }
        return z;
      }),
    }));
  };

  const deleteZone = (zoneId) => {
    const z = zones.find((z) => z.id === zoneId);
    if (!window.confirm(`Delete zone "${z?.name}"?`)) return;
    api.delete(`/zones/${zoneId}`).catch(console.error);
    setZonesMap((m) => ({
      ...m,
      [selectedImage.id]: m[selectedImage.id].filter((z) => z.id !== zoneId),
    }));
    if (editingZoneId === zoneId) {
      setEditingZoneId(null);
      setZoneName("");
      setCurrentPoints([]);
    }
  };

  const saveZone = async () => {
    if (!zoneName.trim()) return;
    const coords = (
      editingZoneId
        ? zones.find((z) => z.id === editingZoneId).points
        : currentPoints
    ).reduce((a, v, i, arr) => {
      if (i % 2 === 0) a.push({ x: arr[i], y: arr[i + 1] });
      return a;
    }, []);
    if (editingZoneId) {
      await api.put(`/zones/${editingZoneId}`, {
        name: zoneName,
        polygon_coords: coords,
      });
      setZonesMap((m) => ({
        ...m,
        [selectedImage.id]: m[selectedImage.id].map((z) =>
          z.id === editingZoneId
            ? {
                ...z,
                name: zoneName,
                points: coords.flatMap((p) => [p.x, p.y]),
              }
            : z
        ),
      }));
    } else {
      const res = await api.post("/zones", {
        image_id: selectedImage.id,
        name: zoneName,
        polygon_coords: coords,
      });
      const newZ = {
        id: res.data.id,
        name: res.data.name,
        points: coords.flatMap((p) => [p.x, p.y]),
      };
      setZonesMap((m) => ({
        ...m,
        [selectedImage.id]: [...(m[selectedImage.id] || []), newZ],
      }));
    }
    setEditingZoneId(null);
    setZoneName("");
    setCurrentPoints([]);
  };

  const undoPoint = () => setCurrentPoints((p) => p.slice(0, -2));

  const handleVertexDrag = (zoneId, idx, e) => {
    if (zoneId !== editingZoneId) return;
    const { x, y } = e.target.position();
    setZonesMap((m) => ({
      ...m,
      [selectedImage.id]: m[selectedImage.id].map((z) =>
        z.id === zoneId
          ? {
              ...z,
              points: z.points.map((v, i) =>
                i === idx * 2 ? x : i === idx * 2 + 1 ? y : v
              ),
            }
          : z
      ),
    }));
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - var(--navbar-height))' }}>
      {/* LEFT: Image list */}
      <Box sx={{ width: "30%", bgcolor: "grey.200", p: 2, overflow: "auto" }}>
        <Button variant="outlined" sx={{ mb: 2 }} onClick={() => navigate("/")}>
          ← Back
        </Button>
        <Typography variant="h6">Images</Typography>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {images.map((img) => (
            <Grid item xs={6} key={img.id}>
              <Card>
                <CardActionArea onClick={() => handleImageSelect(img)}>
                  <CardMedia
                    component="img"
                    image={`${process.env.REACT_APP_API_URL}${img.url}`}
                    sx={{ height: 200, objectFit: "contain" }}
                  />
                  <CardContent>
                    <Typography noWrap>{img.filename}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CENTER: Canvas */}
      <Box sx={{ flexGrow: 1, p: 2, bgcolor: "grey.100", overflow: "auto" }}>
        <Typography variant="h6">Zone Map</Typography>
        {selectedImage && img && (
          <Box
            sx={{
              position: "relative",
              width: img.width * scale,
              height: img.height * scale,
              margin: "0 auto",
            }}
          >
            {!zoneName.trim() && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  bgcolor: "rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  zIndex: 1,
                }}
              >
                Enter a zone name
              </Box>
            )}
            <Stage
              width={img.width}
              height={img.height}
              onClick={handleCanvasClick}
              ref={stageRef}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                display: "block",
                pointerEvents: zoneName.trim() ? "auto" : "none",
              }}
            >
              <Layer>
                <KonvaImage image={img} width={img.width} height={img.height} />
                {zones.map((z) => (
                  <React.Fragment key={z.id}>
                    <Line
                      points={z.points}
                      closed
                      stroke={editingZoneId === z.id ? "red" : "blue"}
                      strokeWidth={2}
                      opacity={editingZoneId && z.id !== editingZoneId ? 0.3 : 1}
                    />
                    {z.points.reduce((arr, _, i) => {
                      if (i % 2 === 0) {
                        const x = z.points[i],
                          y = z.points[i + 1],
                          vid = i / 2;
                        arr.push(
                          <Circle
                            key={`${z.id}-${vid}`}
                            x={x}
                            y={y}
                            radius={5}
                            fill={z.id === editingZoneId ? "green" : "blue"}
                            stroke={z.id === editingZoneId ? "white" : "blue"}
                            strokeWidth={2}
                            draggable={z.id === editingZoneId}
                            onDragMove={(e) => handleVertexDrag(z.id, vid, e)}
                            onClick={() => deletePoint(z.id, vid)}
                            opacity={editingZoneId && z.id !== editingZoneId ? 0.3 : 1}
                          />
                        );
                      }
                      return arr;
                    }, [])}
                  </React.Fragment>
                ))}
                {!editingZoneId && currentPoints.length >= 2 && (
                  <Line points={currentPoints} stroke="red" strokeWidth={2} />
                )}
                {!editingZoneId &&
                  currentPoints.reduce((arr, _, i) => {
                    if (i % 2 === 0) {
                      const x = currentPoints[i],
                        y = currentPoints[i + 1];
                      arr.push(
                        <Circle
                          key={`new-${i}`}
                          x={x}
                          y={y}
                          radius={3}
                          fill="red"
                        />
                      );
                    }
                    return arr;
                  }, [])}
              </Layer>
            </Stage>
          </Box>
        )}
      </Box>

      {/* RIGHT: Controls*/}
      <Box
        sx={{
          width: "30%",
          bgcolor: "background.paper",
          p: 2,
          overflow: "auto",
        }}
      >
        <Typography variant="h6">Controls</Typography>
        {selectedImage && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Mode: {pointMode === "add" ? "Add" : "Delete"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, my: 1 }}>
              <Button
                variant={pointMode === "add" ? "contained" : "outlined"}
                onClick={() => setPointMode("add")}
              >
                Add
              </Button>
              <Button
                variant={pointMode === "delete" ? "contained" : "outlined"}
                onClick={() => setPointMode("delete")}
              >
                Delete
              </Button>
            </Box>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              {editingZoneId ? "Edit" : "New"} Zone
            </Typography>
            <TextField
              required
              label="Zone Name"
              size="small"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              fullWidth
              sx={{ mb: 1 }}
            />
            <Button
              variant="contained"
              onClick={saveZone}
              disabled={!zoneName.trim()}
              fullWidth
            >
              {editingZoneId ? "Save Changes" : "Finish Zone"}
            </Button>
            {editingZoneId && (
              <Button
                variant="outlined"
                onClick={() => {
                  setEditingZoneId(null);
                  setZoneName("");
                  setCurrentPoints([]);
                }}
                fullWidth
                sx={{ mt: 1 }}
              >
                Cancel Edit
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={undoPoint}
              fullWidth
              sx={{ mt: 1 }}
            >
              Undo
            </Button>

            <Typography variant="subtitle1" sx={{ mt: 3 }}>
              Existing Zones
            </Typography>
            <List>
              {zones.map((z) => (
              <ListItemButton sx={{p:0}} selected={editingZoneId===z.id}>
                <ListItem
                  key={z.id}
                  button
                  selected={editingZoneId === z.id}
                  onClick={() => startEditZone(z)}
                  sx={{ width: "100%", justifyContent: "space-between"}}
                >
                  <ListItemText primary={z.name} />
                  <IconButton edge="end" onClick={() => deleteZone(z.id)}>
                    <Delete />
                  </IconButton>
                </ListItem>
              </ListItemButton>
              ))}
            </List>
          </>
        )}
      </Box>
    </Box>
  );
}
