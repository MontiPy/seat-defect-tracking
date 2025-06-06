import React, { useEffect, useRef } from "react";
import h337 from "heatmap.js";

export default function DefectHeatmapOverlay({ defects, width, height, scale = 1 }) {
  const ref = useRef();
  const instance = useRef();

  useEffect(() => {
    if (!ref.current) return;

    if (!instance.current) {
      instance.current = h337.create({
        container: ref.current,
        radius: 60, // how "blurry"/wide each defect point is
        maxOpacity: 1,
        minOpacity: 1,
        blur: 0,
        gradient: { 0.4: 'blue', 0.65: 'yellow', 1: 'red' }, // optional custom colors
      });
    }
    // Prepare heatmap data (scale defect coords if needed)
    // const data = {
    //   max: 8, // Adjust for expected max "hotness" (bigger = less red)
    //   data: (defects || []).map((d) => ({
    //     x: d.x * scale,
    //     y: d.y * scale,
    //     value: 1, // Each defect = 1 "heat"
    //   })),
    // };
    // instance.current.setData(data);
    const data = {
        max: 10,
        data: [
          { x: width / 2, y: height / 2, value: 10 }, // bright spot in the center
        ],
      };
      instance.current.setData(data);
      console.log('Setting dummy heatmap data', width, height, data);
  }, [defects, width, height, scale]);


  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        pointerEvents: "none",
        top: 0,
        left: 0,
        width,
        height,
        zIndex: 10,
        // background: "rgba(0,255,0,0.15)", // TEMP: Green, remove after test
      }}
    />
  );
}
