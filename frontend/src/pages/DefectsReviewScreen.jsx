// src/screens/DefectsReviewScreen.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import DefectMap from "../components/DefectMap";
import DefectList from "../components/DefectList";
import api from "../services/api";

export default function DefectsReviewScreen() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [images, setImages] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Fetch project details
  useEffect(() => {
    api
      .get(`/projects/${projectId}`)
      .then((res) => setProject(res.data))
      .catch(console.error);
  }, [projectId]);

  // Fetch all images for this project
  useEffect(() => {
    api
      .get("/images", { params: { project_id: projectId } })
      .then((res) => {
        setImages(res.data);
        setCurrentIndex(0);
      })
      .catch(console.error);
  }, [projectId, refreshKey]);

  if (!project) {
    return <Typography>Loading project…</Typography>;
  }

  const prevImage = () =>
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () =>
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", p: 2, gap: 2 }}>
      {/* ──── LEFT: Carousel of maps ──── */}
      <Box sx={{ flexGrow: 1, position: "relative" }}>
        <Typography variant="h5" gutterBottom>
          Project: {project.name} — Defect Review
        </Typography>
        <Button
          variant="outlined"
          sx={{
            mb: 2,
            display: "block",
            textAlign: "center",
            maxHeight: "calc(100vh - 80px)",
            overflowY: "auto",
          }}
          onClick={() => navigate("/")}
        >
          ← Back to Project Select
        </Button>
        <Button
          variant="outlined"
          sx={{ mb: 2, ml: 2 }}
          onClick={() => {
            window.location.href = `${process.env.REACT_APP_API_URL}/projects/${projectId}/export`;
          }}
        >
          Download Excel
        </Button>

        {images.length > 0 ? (
          <>
            {/* Prev button */}
            <IconButton
              onClick={prevImage}
              sx={{
                position: "absolute",
                top: "50%",
                left: 8,
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.7)",
                zIndex: 1,
              }}
            >
              <ArrowBackIos />
            </IconButton>

            {/* The map itself */}
            <Box sx={{ width: "100%", maxWidth: "75vw", mx: "auto" }}>
              <DefectMap
                imageId={images[currentIndex].id}
                imageUrl={images[currentIndex].url}
                refreshKey={refreshKey}
                zonefill="transparent"
                defectfill="red"
                showHeatmap={showHeatmap}
              />
            </Box>

            {/* Next button */}
            <IconButton
              onClick={nextImage}
              sx={{
                position: "absolute",
                top: "50%",
                right: 8,
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.7)",
                zIndex: 1,
              }}
            >
              <ArrowForwardIos />
            </IconButton>

            {/* Index indicator and refresh */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: "80%",
                bgcolor: "rgba(255,255,255,0.85)",
                px: 1.5,
                py: 1,
                borderRadius: 1,
                textAlign: "center",
                zIndex: 10,
              }}
            >
              <Typography variant="subtitle1" color="text.secondary">
                {images[currentIndex].filename ||
                  images[currentIndex].url.split("/").pop()}
              </Typography>
              <Typography variant="body2">
                {currentIndex + 1} / {images.length}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setRefreshKey((k) => k + 1)}
                sx={{ mt: 1 }}
              >
                Refresh Maps
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowHeatmap((v) => !v)}
                sx={{ mt: 1 }}
              >
                {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
              </Button>
            </Box>
          </>
        ) : (
          <Typography>No images found for this project.</Typography>
        )}
      </Box>

      {/* ──── RIGHT: Sticky defect list ──── */}
      <Box
        component="aside"
        sx={{
          width: 500,
          position: "sticky",
          top: 16,
          alignSelf: "flex-start",
          height: "calc(100vh - 64px)",
          overflowY: "auto",
          pl: 2,
          borderLeft: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" gutterBottom>
          All Logged Defects
        </Typography>
        <DefectList
          projectId={projectId}
          refreshKey={refreshKey}
          showActions={false}
          highlightImageId={images[currentIndex]?.id}
        />
      </Box>
    </Box>
  );
}
