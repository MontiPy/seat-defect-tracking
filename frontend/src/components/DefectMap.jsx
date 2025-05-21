// frontend/src/components/DefectMap.jsx

import React, { useState, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Circle } from "react-konva";
import useImage from "use-image";
import api from "../services/api";


// custom hook to track window dimensions
function useWindowDimensions() {
  const [dims, setDims] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDims({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dims;
}

export default function DefectMap({ imageId, imageUrl, onClick, selectedPosition, refreshKey }) {
  // 1) Build absolute URL
  const imgSrc = imageUrl.startsWith("http")
    ? imageUrl
    : `${process.env.REACT_APP_API_URL}${imageUrl}`;

  // 2) Load the image
  const [img, status] = useImage(imgSrc);

  // 3) Track window size and derive maxWidth = 50% of viewport
  const { width: vw, height: vh } = useWindowDimensions();
  const maxWidth = vw * 0.5; // 50% of screen width
  const maxHeight = vh * 0.8; // e.g. up to 80% of screen height

  // 4) Compute scale once image loads
  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (img) {
      const scaleX = maxWidth / img.width;
      const scaleY = maxHeight / img.height;
      setScale(Math.min(scaleX, scaleY, 1));
    }
  }, [img, maxWidth, maxHeight]);

  // 5) Fetch zones & defects whenever imageID or refreshKey changes
  const [zones, setZones] = useState([]);
  const [defects, setDefects] = useState([]);
  useEffect(() => {
    api.get(`/images/${imageId}/zones`).then(r => {
      const parsed = r.data.map(z => ({
        ...z,
        polygon_coords: typeof z.polygon_coords === 'string'
          ? JSON.parse(z.polygon_coords)
          : z.polygon_coords
      }));
      setZones(parsed);
    });
    api.get(`/images/${imageId}/defects`).then(r => setDefects(r.data));
  }, [imageId, refreshKey]);

  // 6) Handle click (convert back to original coords)

  const handleStageClick = (e) => {
    const { x, y } = e.target.getStage().getPointerPosition();
    onClick({ x: x / scale, y: y / scale });
  };

  // // 7) Save defect
  // const handleSave = (formData) => {
  //   api
  //     .post("/defects", {
  //       image_id: imageId,
  //       zone_id: formData.zone_id,
  //       x: selectedPosition.x,
  //       y: selectedPosition.y,
  //       cbu: formData.cbu,
  //       part_id: formData.part_id,
  //       build_event_id: formData.build_event_id,
  //       noted_by: formData.noted_by,
  //     })
  //     .then((r) => {
  //       setDefects((ds) => [...ds, r.data]);

  //     });
  // };

  // 8) Render
  return (
    <>
      {status !== "loaded" && <p>Loading image…</p>}

      {status === "loaded" && (
        <Stage
          width={maxWidth}
          height={maxHeight}
          onClick={handleStageClick}
          style={{
            // center it, optional padding
            margin: "0 auto",
            display: "block",
          }}
        >
          <Layer>
            <KonvaImage
              image={img}
              x={0}
              y={0}
              width={img.width * scale}
              height={img.height * scale}
            />

            {zones.map((z) => (
              <Line
                key={z.id}
                points={z.polygon_coords.flatMap((p) => [
                  p.x * scale,
                  p.y * scale,
                ])}
                closed
                opacity={1}
                fill="rgba(255,0,0,0.1)"
                stroke="blue"
                strokeWidth={4}
              />
            ))}

            {defects.map((d) => (
              <Circle
                key={d.id}
                x={d.x * scale}
                y={d.y * scale}
                radius={4}
                fill="yellow"
                stroke="black"
                strokeWidth={2}
              />
            ))}

            {selectedPosition && (
              <Circle
                x={selectedPosition.x * scale}
                y={selectedPosition.y * scale}
                radius={6}
                fill="red"
                stroke="black"
                strokeWidth={2}
              />
            )}
          </Layer>
        </Stage>
      )}
    </>
  );
}
