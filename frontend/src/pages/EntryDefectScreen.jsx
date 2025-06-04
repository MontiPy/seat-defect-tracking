import React, { useState, useEffect } from "react";
import inside from "point-in-polygon";
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import api from "../services/api";
import DefectMap from "../components/DefectMap";
import DefectFormModal from "../components/DefectFormModal";
import DefectList from "../components/DefectList";
import { useLocation, useNavigate } from "react-router-dom";

export default function EntryDefectScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedProject = location.state?.project;

  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zones, setZones] = useState([]);
  const [clickPos, setClickPos] = useState(null);
  const [autoZoneId, setAutoZoneId] = useState(null);
  const [defectRefresh, setDefectRefresh] = useState(0);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [selectedPartName, setSelectedPartName] = useState("");
  const [selectedPartNumber, setSelectedPartNumber] = useState("");


  // load your refs
  useEffect(() => {
    if (selectedProject) {
      api.get(`/images?project_id=${selectedProject}`).then((res) => {
        setImages(res.data);
        if (res.data.length) {
          handleSelectImage(res.data[0]);
        }
      });
    }
  }, [selectedProject]);

  async function handleSelectImage(img) {
    try {
      const res = await api.get(`/images/${img.id}`);
      const data = res.data;
      setSelectedImage(data);
      setSelectedPartId(data.part_id || null);
      setSelectedPartName(data.part_name || "");
      setSelectedPartNumber(data.part_number || "");
    } catch (err) {
      console.error("Failed to fetch image details", err);
      setSelectedImage(img); // fallback
      setSelectedPartId(null);
      setSelectedPartName("");
      setSelectedPartNumber("");
    }
  }

  // whenever the image changes, fetch its zones from the DB
  useEffect(() => {
    if (!selectedImage) {
      setZones([]);
      return;
    }
    api.get(`/images/${selectedImage.id}/zones`)
      .then(res => {
        const parsed = res.data.map(z => {
          // Attempt to extract raw polygon points from various fields
          let raw = [];
          if (typeof z.polygon_coords === 'string') {
            try {
              raw = JSON.parse(z.polygon_coords);
            } catch (e) {
              console.error('Invalid polygon_coords for zone', z.id, e);
            }
          } else if (typeof z.coords_json === 'string') {
            try {
              raw = JSON.parse(z.coords_json);
            } catch (e) {
              console.error('Invalid coords_json for zone', z.id, e);
            }
          } else if (Array.isArray(z.coords)) {
            raw = z.coords;
          } else if (Array.isArray(z.vertices)) {
            raw = z.vertices;
          } else if (z.geometry && Array.isArray(z.geometry.coordinates)) {
            raw = z.geometry.coordinates[0] || [];
          } else {
            console.warn(`No polygon data for zone ${z.id}`);
          }
          // Normalize into [ [x,y], ... ]
          const coords = Array.isArray(raw)
            ? raw.map(p => [p.x, p.y])
            : [];
          return { id: z.id, coords };
        });
        console.log('Parsed zones:', parsed);
        setZones(parsed);
      })
      .catch(err => console.error('Failed to load zones', err));
  }, [selectedImage]);

  // handler that DefectMap will call on click

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* LEFT 1/4: Image selector */}
      <Box sx={{ width: "30%", bgcolor: "grey.200", p: 2, overflow: "auto" }}>
        <Button
          variant="outlined"
          sx={{ mb: 2, display: "block", textAlign: "center" }}
          onClick={() => navigate("/")}
        >
          ← Back to Project Select
        </Button>
        <Typography variant="h6">Image Selection</Typography>
        <Grid container spacing={2} sx={{ paddingTop: "10px" }}>
          {images.map((img) => (
            <Grid item xs={6} key={img.id}>
              <Card>
                <CardActionArea onClick={() => handleSelectImage(img)}>
                  <CardMedia
                    component="img"
                    image={`${process.env.REACT_APP_API_URL}${img.url}`}
                    alt={img.filename}
                    sx={{ height: 200, objectFit: "contain" }}
                  />
                  <CardContent>
                    <Typography variant="body2" noWrap>
                      {img.filename}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CENTER 1/2: DefectMap */}
      <Box
        sx={{
          width: "40%",
          p: 2,
          overflow: "auto",
          borderRight: "1px solid black",
          borderLeft: "1px solid black",
          bgcolor: "grey.100",
        }}
      >
        <Typography variant="h6">Defect Map</Typography>
        <Box sx={{ paddingTop: "10px" }}>
          {selectedImage && (
            <DefectMap
              imageId={selectedImage.id}
              imageUrl={selectedImage.url}
              refreshKey={defectRefresh}
              maxWidthPercent={0.35} // e.g. allow wider map here
              maxHeightPercent={0.9} // but shorter vertically
              onClick={(pos) => {
                setClickPos(pos);
                const hit = zones.find((z) => z && Array.isArray(z.coords) && inside([pos.x, pos.y], z.coords));
                console.log("Hit zone:", hit);
                console.log('Loaded zones:', zones);
                console.log("Click position:", pos);
                setAutoZoneId(hit ? hit.id : null);
              }}
              selectedPosition={clickPos}
            />
          )}
        </Box>
      </Box>

      {/* RIGHT 1/4: Defect entry panel */}
      <Box
        sx={{
          width: "35%",
          bgcolor: "background.paper",
          p: 2,
          overflow: "auto",
        }}
      >
        {selectedImage && (
          <>
            <DefectFormModal
              initialPosition={clickPos ?? { x: 0, y: 0 }}
              initialZoneId={autoZoneId}
              zonesUrl={`/images/${selectedImage.id}/zones`}
              defectsUrl={`/images/${selectedImage.id}/defects`}
              partId={ selectedPartId}
              partName={ selectedPartName }
              partNumber= {selectedPartNumber}
              onSave={(formData) => {
                // 1) actually POST the new defect
                api
                  .post("/defects", {
                    image_id: selectedImage.id,
                    zone_id: formData.zone_id,
                    x: clickPos.x,
                    y: clickPos.y,
                    cbu: formData.cbu,
                    part_id: selectedPartId,
                    build_event_id: formData.build_event_id,
                    noted_by: formData.noted_by,
                  })
                  .then(() => {
                    setClickPos(null); // clear the click marker
                    setDefectRefresh((r) => r + 1); // bump refresh key
                  })
                  .catch(console.error);
              }}
            />
            <DefectList imageId={selectedImage.id} refreshKey={defectRefresh} />
          </>
        )}
      </Box>
    </Box>
  );
}
