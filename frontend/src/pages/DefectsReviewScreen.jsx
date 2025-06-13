// src/screens/DefectsReviewScreen.jsx

import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
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
  const mapRef = useRef(null);
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [parts, setParts] = useState([]);
  const [zones, setZones] = useState([]);
  const [buildEvents, setBuildEvents] = useState([]);
  const [defectTypes, setDefectTypes] = useState([]);
  const [hoveredDefectId, setHoveredDefectId] = useState(null);
  const [filterToImage, setFilterToImage] = useState(true);
  const [filters, setFilters] = useState({
    build_event_id: "",
    defect_type_id: "",
  });

  // Seat pairings management
  const [seatPairings, setSeatPairings] = useState([
    ["81100", "81500"],
    ["81300", "81700"],
    ["82100"],
  ]);
  const [pairInput, setPairInput] = useState(
    "81100,81500;81300,81700;82100"
  );
  // selectedPairIndex of -1 means "ALL"
  const [selectedPairIndex, setSelectedPairIndex] = useState(-1);

  // Fetch project details
  useEffect(() => {
    api
      .get(`/projects/${projectId}`)
      .then((res) => setProject(res.data))
      .catch(console.error);
  }, [projectId]);

  // Fetch images for this project and selected seat pairing
  useEffect(() => {
    if (!projectId) return;

    let ids = [];
    if (selectedPairIndex !== -1) {
      const selectedPair = seatPairings[selectedPairIndex] || [];
      ids = selectedPair
        .map((num) => parts.find((p) => p.seat_part_number === num)?.id)
        .filter(Boolean);
    }

    const params = { project_id: projectId };
    if (ids.length) {
      params.part_ids = ids.join(",");
    }

    api
      .get("/images", { params })
      .then((res) => {
        setImages(res.data);
        setCurrentIndex(0);
      })
      .catch(console.error);
  }, [projectId, refreshKey, seatPairings, selectedPairIndex, parts]);

  useEffect(() => {
    api
      .get("/parts")
      .then((res) => setParts(res.data))
      .catch(console.error);
    api
      .get("/zones")
      .then((res) => setZones(res.data))
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

  function getPartNumber(part_id) {
    const part = parts.find((p) => p.id === part_id);
    return part
      ? `${part.seat_part_number}${
          part.description ? " - " + part.description : ""
        }`
      : part_id;
  }

  function getZoneName(zone_id) {
    const zone = zones.find((z) => z.id === zone_id);
    return zone ? zone.name : zone_id;
  }

  function getBuildEventName(build_event_id) {
    const event = buildEvents.find((ev) => ev.id === build_event_id);
    return event ? event.name : build_event_id;
  }

  function getDefectTypeName(defect_type_id) {
    const dt = defectTypes.find((dt) => dt.id === defect_type_id);
    return dt ? dt.name : defect_type_id;
  }

  if (!project) {
    return <Typography>Loading project…</Typography>;
  }


  // Handle list item click
  const handleDefectClick = (defect) => {
    setSelectedDefect(defect);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDefect(null);
  };

  const sanitizeSheetName = (name) =>
    name.replace(/[\\/?*[\]:]/g, "").slice(0, 31);

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();

    // Lookup tables so we can display names instead of IDs
    const [partsRes, eventsRes, typesRes] = await Promise.all([
      api.get("/parts"),
      api.get("/build-events"),
      api.get("/defect-types"),
    ]);
    const partsMap = Object.fromEntries(
      partsRes.data.map((p) => [p.id, p.seat_part_number])
    );
    const eventsMap = Object.fromEntries(
      eventsRes.data.map((ev) => [ev.id, ev.name])
    );
    const typesMap = Object.fromEntries(
      typesRes.data.map((dt) => [dt.id, dt.name])
    );

    const prevIndex = currentIndex;
    const prevHeat = showHeatmap;

    for (let i = 0; i < images.length; i++) {
      setCurrentIndex(i);
      setShowHeatmap(true);
      await new Promise((r) => setTimeout(r, 300));
      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        allowTaint: true,
      });

      const baseName = images[i].filename || images[i].url.split("/").pop();
      const ws = workbook.addWorksheet(
        sanitizeSheetName(baseName) || `Image ${i + 1}`
      );

      const imgId = workbook.addImage({
        base64: canvas.toDataURL("image/png"),
        extension: "png",
      });
      ws.addImage(imgId, {
        tl: { col: 0, row: 0 },
        ext: { width: 500, height: (500 * canvas.height) / canvas.width },
      });

      const [{ data: defects }, { data: zones }] = await Promise.all([
        api.get(`/images/${images[i].id}/defects`),
        api.get(`/images/${images[i].id}/zones`),
      ]);
      const zoneMap = Object.fromEntries(zones.map((z) => [z.id, z.name]));

      ws.addRow([]);
      ws.addRow([
        "ID",
        "Photo",
        "Zone",
        "CBU",
        "Part #",
        "Build Event",
        "Defect Type",
      ]);

      for (const d of defects) {
        const row = ws.addRow([
          d.id,
          "",
          zoneMap[d.zone_id] || d.zone_id,
          d.cbu,
          partsMap[d.part_id] || d.part_id,
          eventsMap[d.build_event_id] || d.build_event_id,
          typesMap[d.defect_type_id] || d.defect_type_id,
        ]);
        if (d.photo_url) {
          try {
            const resp = await fetch(
              `${process.env.REACT_APP_API_URL}${d.photo_url}`
            );
            const blob = await resp.blob();
            const base64 = await blobToBase64(blob);
            const ext = blob.type.includes("png") ? "png" : "jpeg";
            const picId = workbook.addImage({ base64, extension: ext });
            const r = row.number - 1; // zero-index
            ws.addImage(picId, {
              tl: { col: 1, row: r },
              ext: { width: 50, height: 50 },
            });
            ws.getRow(row.number).height = 40;
          } catch (e) {
            console.error(e);
          }
        }
      }
    }

    setCurrentIndex(prevIndex);
    setShowHeatmap(prevHeat);

    const buf = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `defect-report-${projectId}.xlsx`
    );
  };

  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        const base64 = dataUrl.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

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

        {/* Seat pairing selector */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="pair-select-label">Seat Pair</InputLabel>
            <Select
              labelId="pair-select-label"
              label="Seat Pair"
              value={selectedPairIndex}
              onChange={(e) => setSelectedPairIndex(e.target.value)}
            >
              <MenuItem value={-1}>ALL</MenuItem>
              {seatPairings.map((pair, idx) => (
                <MenuItem key={idx} value={idx}>
                  {pair.join(" & ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Edit Pairings"
            size="small"
            value={pairInput}
            onChange={(e) => setPairInput(e.target.value)}
            sx={{ minWidth: 250 }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const newPairs = pairInput
                .split(";")
                .map((p) =>
                  p
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
                .filter((arr) => arr.length);
              if (newPairs.length) {
                setSeatPairings(newPairs);
                setSelectedPairIndex(-1);
              }
            }}
          >
            Update
          </Button>
        </Box>

        {images.length > 0 ? (
          <>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {images.map((img, idx) => (
                <Box
                  key={img.id}
                  sx={{ width: "100%", maxWidth: "45%", mx: "auto" }}
                  ref={idx === 0 ? mapRef : null}
                >
                  <DefectMap
                    imageId={img.id}
                    imageUrl={img.url}
                    refreshKey={refreshKey}
                    filters={filters}
                    zonefill="transparent"
                    defectfill="red"
                    showHeatmap={showHeatmap}
                    hoveredDefectId={hoveredDefectId}
                  />
                  <Typography
                    variant="subtitle2"
                    align="center"
                    sx={{ mt: 1 }}
                  >
                    {img.filename || img.url.split("/").pop()}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setRefreshKey((k) => k + 1)}
                sx={{ mr: 1 }}
              >
                Refresh Maps
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowHeatmap((v) => !v)}
                sx={{ mr: 1 }}
              >
                {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleExportExcel}
              >
                Export Excel
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
        <Button
  size="small"
  variant={filterToImage ? "contained" : "outlined"}
  onClick={() => setFilterToImage(f => !f)}
>
  {filterToImage ? "Showing: This Image" : "Showing: All Project Defects"}
</Button>
        <DefectList
          projectId={projectId}
          imageId={filterToImage ? images[0]?.id : undefined}
          refreshKey={refreshKey}
          filters={filters}
          onFiltersChange={setFilters}
          showActions={false}
          highlightImageId={images[0]?.id}
          onDefectClick={handleDefectClick}
          onDefectHover={setHoveredDefectId}
          onDefectHoverOut={() => setHoveredDefectId(null)}
        />
        {/* Modal is here, in the parent */}
        <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="lg">
          <DialogTitle>Defect Details</DialogTitle>
          <DialogContent>
            {selectedDefect && (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={2}
              >
                <img
                  src={`${process.env.REACT_APP_API_URL}${selectedDefect.photo_url}`}
                  alt="Defect"
                  style={{ maxWidth: 500, borderRadius: 8 }}
                />
                <Box>
                  <div>
                    <b>Part #:</b> {getPartNumber(selectedDefect.part_id)}
                  </div>
                  <div>
                    <b>Zone:</b> {getZoneName(selectedDefect.zone_id)}
                  </div>
                  <div>
                    <b>Build Event:</b>{" "}
                    {getBuildEventName(selectedDefect.build_event_id)}
                  </div>
                  <div>
                    <b>Defect Type:</b>{" "}
                    {getDefectTypeName(selectedDefect.defect_type_id)}
                  </div>
                  {/* etc */}
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}
