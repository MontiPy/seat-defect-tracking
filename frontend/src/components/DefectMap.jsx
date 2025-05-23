// // frontend/src/components/DefectMap.jsx

// import React, { useState, useEffect } from "react";
// import { Stage, Layer, Image as KonvaImage, Line, Circle } from "react-konva";
// import useImage from "use-image";
// import api from "../services/api";

// // custom hook to track window dimensions
// function useWindowDimensions() {
//   const [dims, setDims] = useState({
//     width: window.innerWidth,
//     height: window.innerHeight,
//   });

//   useEffect(() => {
//     const handleResize = () => {
//       setDims({
//         width: window.innerWidth,
//         height: window.innerHeight,
//       });
//     };
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return dims;
// }

// export default function DefectMap({
//   imageId,
//   imageUrl,
//   onClick,
//   selectedPosition,
//   refreshKey,
// }) {
//   // 1) Build absolute URL
//   const imgSrc = imageUrl.startsWith("http")
//     ? imageUrl
//     : `${process.env.REACT_APP_API_URL}${imageUrl}`;

//   // 2) Load the image
//   const [img, status] = useImage(imgSrc);

//   // 3) Track window size and derive maxWidth = 25% of viewport
//   const { width: vw, height: vh } = useWindowDimensions();
//   const maxWidth = vw * 0.25; // 30% of screen width
//   const maxHeight = vh * 0.8; // e.g. up to 80% of screen height

//   // 4) Compute scale once image loads
//   const [scale, setScale] = useState(1);
//   useEffect(() => {
//     if (img) {
//       const scaleX = maxWidth / img.width;
//       const scaleY = maxHeight / img.height;
//       setScale(Math.min(scaleX, scaleY, 1));
//     }
//   }, [img, maxWidth, maxHeight]);

//   // 5) Fetch zones & defects whenever imageID or refreshKey changes
//   const [zones, setZones] = useState([]);
//   const [defects, setDefects] = useState([]);
//   useEffect(() => {
//     api.get(`/images/${imageId}/zones`).then((r) => {
//       const parsed = r.data.map((z) => ({
//         ...z,
//         polygon_coords:
//           typeof z.polygon_coords === "string"
//             ? JSON.parse(z.polygon_coords)
//             : z.polygon_coords,
//       }));
//       setZones(parsed);
//     });
//     api.get(`/images/${imageId}/defects`).then((r) => setDefects(r.data));
//   }, [imageId, refreshKey]);

//   // 6) Handle click (convert back to original coords)

//   const handleStageClick = (e) => {
//     const { x, y } = e.target.getStage().getPointerPosition();
//     onClick({ x: x / scale, y: y / scale });
//   };

//   // 8) Render
//   return (
//     <>
//       {status !== "loaded" && <p>Loading image…</p>}

//       {status === "loaded" && (
//         <Stage
//           width={img.width * scale}
//           height={img.height * scale}
//           onClick={onClick ? handleStageClick : undefined}
//           style={{
//             // center it, optional padding
//             margin: "0 auto",
//             display: "block",
//           }}
//         >
//           <Layer>
//             <KonvaImage
//               image={img}
//               x={0}
//               y={0}
//               width={img.width * scale}
//               height={img.height * scale}
//             />

//             {zones.map((z) => (
//               <Line
//                 key={z.id}
//                 points={z.polygon_coords.flatMap((p) => [
//                   p.x * scale,
//                   p.y * scale,
//                 ])}
//                 closed
//                 opacity={1}
//                 fill="rgba(255,0,0,0.1)"
//                 stroke="blue"
//                 strokeWidth={4}
//               />
//             ))}

//             {defects.map((d) => (
//               <Circle
//                 key={d.id}
//                 x={d.x * scale}
//                 y={d.y * scale}
//                 radius={4}
//                 fill="yellow"
//                 stroke="black"
//                 strokeWidth={2}
//               />
//             ))}

//             {selectedPosition && (
//               <Circle
//                 x={selectedPosition.x * scale}
//                 y={selectedPosition.y * scale}
//                 radius={6}
//                 fill="red"
//                 stroke="black"
//                 strokeWidth={2}
//               />
//             )}
//           </Layer>
//         </Stage>
//       )}
//     </>
//   );
// }

// frontend/src/components/DefectMap.jsx

import React, { useState, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Circle } from "react-konva";
import useImage from "use-image";
import api from "../services/api";

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
}) {
  // Build full URL for the image
  const imgSrc = imageUrl.startsWith("http")
    ? imageUrl
    : `${process.env.REACT_APP_API_URL}${imageUrl}`;

  // Load the image
  const [img, status] = useImage(imgSrc);

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
        width: img.width * scale,
        height: img.height * scale,
        margin: "0 auto",
      }}
    >
      <Stage
        width={img.width}
        height={img.height}
        onClick={onClick ? handleStageClick : undefined}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          display: "block",
        }}
      >
        <Layer>
          <KonvaImage image={img} x={0} y={0} width={img.width} height={img.height} />
          {zones.map((z) => (
            <Line
              key={z.id}
              points={z.polygon_coords.flatMap((p) => [p.x, p.y])}
              closed
              fill="rgba(255,0,0,0.1)"
              stroke="blue"
              strokeWidth={4}
            />
          ))}
          {defects.map((d) => (
            <Circle
              key={d.id}
              x={d.x}
              y={d.y}
              radius={4}
              fill="yellow"
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
