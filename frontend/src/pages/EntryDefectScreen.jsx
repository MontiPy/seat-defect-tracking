import React, { useState, useEffect } from "react";
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
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });
  const [defectRefresh, setDefectRefresh] = useState(0);

  // load your 4 refs
  useEffect(() => {
    if (selectedProject) {
      console.log("Selected Project:", selectedProject);
      api.get(`/images?project_id=${selectedProject}`).then((res) => {
        setImages(res.data);
        if (res.data.length) {
          setSelectedImage(res.data[0]);
        }
      });
    }
  }, [selectedProject]);

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
        <Grid container spacing={2}>
          {images.slice(0, 4).map((img) => (
            <Grid item xs={6} key={img.id}>
              <Card>
                <CardActionArea onClick={() => setSelectedImage(img)}>
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
        <Box>
          {selectedImage && (
            <DefectMap
              imageId={selectedImage.id}
              imageUrl={selectedImage.url}
              onClick={(pos) => setClickPos(pos)}
              selectedPosition={clickPos}
              refreshKey={defectRefresh}
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
              zonesUrl={`/images/${selectedImage.id}/zones`}
              defectsUrl={`/images/${selectedImage.id}/defects`}
              onSave={(formData) => {
                // 1) actually POST the new defect
                api
                  .post("/defects", {
                    image_id: selectedImage.id,
                    zone_id: formData.zone_id,
                    x: clickPos.x,
                    y: clickPos.y,
                    cbu: formData.cbu,
                    part_id: formData.part_id,
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
