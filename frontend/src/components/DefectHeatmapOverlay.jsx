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
    // If the overlay size changes, update the heatmap dimensions
    if (instance.current._renderer) {
        instance.current._renderer.setDimensions(width, height);
      }
    // Prepare heatmap data (scale defect coords if needed)
    const data = {
      max: defects.length || 1, // Adjust for expected max "hotness" (bigger = less red)
      data: (defects || []).map((d) => ({
        x: Math.round(d.x * scale),
        y: Math.round(d.y * scale),
        value: 1, // Each defect = 1 "heat"
      })),
    };
    instance.current.setData(data);


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
