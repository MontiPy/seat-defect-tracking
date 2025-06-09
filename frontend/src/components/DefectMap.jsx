// frontend/src/components/DefectMap.jsx

import React, { useState, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Circle } from "react-konva";
import useImage from "use-image";
import api from "../services/api";
import DefectHeatmapOverlay from "./DefectHeatmapOverlay";

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

export default function DefectMap({
  imageId,
  imageUrl,
  onClick,
  selectedPosition,
  refreshKey,
  maxWidthPercent = 0.75,   // defaults to 75% of vw
  maxHeightPercent = 0.8,   // defaults to 80% of vh
  zonefill = "rgba(255,0,0,0.2)", // default to filled red
  defectfill = "yellow", // default defect fill color
  showHeatmap = true, // default to show heatmap
  hoveredDefectId,
}) {
  // Build full URL for the image
  const imgSrc = imageUrl.startsWith("http")
    ? imageUrl
    : `${process.env.REACT_APP_API_URL}${imageUrl}`;

  // Load the image
  const [img, status] = useImage(imgSrc, "anonymous");

  // Fetch zones & defects
  const [zones, setZones] = useState([]);
  const [defects, setDefects] = useState([]);
  useEffect(() => {
    api.get(`/images/${imageId}/zones`).then((r) => {
      setZones(
        r.data.map((z) => ({
          ...z,
          polygon_coords:
            typeof z.polygon_coords === "string"
              ? JSON.parse(z.polygon_coords)
              : z.polygon_coords,
        }))
      );
    });
    api.get(`/images/${imageId}/defects`).then((r) => setDefects(r.data));
  }, [imageId, refreshKey]);

  // compute scale to fit within the given viewport ratios
  const { width: vw, height: vh } = useWindowDimensions();
  const maxW = vw * maxWidthPercent;
  const maxH = vh * maxHeightPercent;
  const scale =
    img && img.width && img.height
      ? Math.min(maxW / img.width, maxH / img.height, 1)
      : 1;

  // click handler (positions in natural pixels)
  const handleStageClick = (e) => {
    if (!onClick) return;
    const pos = e.target.getStage().getPointerPosition();
    onClick({ x: pos.x, y: pos.y });
  };

  if (status !== "loaded") return <p>Loading image…</p>;

  return (
    <div
      style={{
        position: "relative",
        width: img.width * scale,
        height: img.height * scale,
        margin: "0 auto",
      }}
    >
      {showHeatmap && (
        <DefectHeatmapOverlay
          defects={defects}
          width={img.width * scale}
          height={img.height * scale}
          scale={scale}
        />
      )}

      <Stage
        width={img.width}
        height={img.height}
        onClick={onClick ? handleStageClick : undefined}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          display: "block",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      >
        <Layer>
          <KonvaImage image={img} x={0} y={0} width={img.width} height={img.height} />
          {zones.map((z) => (
            <Line
              key={z.id}
              points={z.polygon_coords.flatMap((p) => [p.x, p.y])}
              closed
              fill={zonefill}
              stroke="blue"
              strokeWidth={3}
            />
          ))}
          {defects.map((d) => (
            <Circle
              key={d.id}
              x={d.x}
              y={d.y}
              radius={d.id === hoveredDefectId ? 12 : 6} // Enlarge on hover
              fill={defectfill}
              stroke="black"
              strokeWidth={2}
            />
          ))}
          {selectedPosition && (
            <Circle
              x={selectedPosition.x}
              y={selectedPosition.y}
              radius={6}
              fill="red"
              stroke="black"
              strokeWidth={2}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
