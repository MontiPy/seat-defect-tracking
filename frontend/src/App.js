import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
} from "@mui/material";
import api from "./services/api";
import DefectMap from "./components/DefectMap";
import DefectFormModal from "./components/DefectFormModal";
import DefectList from './components/DefectList';



export default function App() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [clickPos, setClickPos] = useState(null);

  // load your 4 refs
  useEffect(() => {
    api.get("/images").then((res) => {
      setImages(res.data);
      if (res.data.length) setSelectedImage(res.data[0]);
    });
  }, []);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* LEFT 1/4: Image selector */}
      <Box sx={{ width: "30%", bgcolor: "grey.100", p: 2, overflow: "auto" }}>
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
                    sx={{ height: 300, objectFit: "contain" }}
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
      <Box sx={{ width: "40%", p: 2, overflow: "auto" }}>
      <Typography variant="h6">Defect Map</Typography>
        {selectedImage && (
          <DefectMap
            imageId={selectedImage.id}
            imageUrl={selectedImage.url}
            onClick={(pos) => setClickPos(pos)}
          />
        )}
      </Box>

      {/* RIGHT 1/4: Defect entry panel */}
      <Box
        sx={{
          width: "30%",
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
            onSave={() => setClickPos(null)}
          />
          <DefectList imageId={selectedImage.id} />
          </>
        )}
      </Box>
    </Box>
  );
}
