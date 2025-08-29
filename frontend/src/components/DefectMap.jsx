/**
 * DefectMap - Interactive Canvas-Based Defect Visualization Component
 *
 * This component provides a sophisticated canvas-based interface for visualizing
 * and interacting with defects on reference images. Built using Konva.js for
 * high-performance 2D rendering and React-Konva for React integration.
 *
 * Key Features:
 * - High-performance canvas rendering with Konva.js
 * - Interactive defect placement via mouse/touch clicks
 * - Real-time defect visualization with customizable markers
 * - Zone polygon rendering with transparency
 * - Heatmap overlay for defect density analysis
 * - Responsive sizing based on viewport dimensions
 * - Image scaling and aspect ratio preservation
 * - Filter-based defect visibility control
 *
 * Canvas Layers (bottom to top):
 * 1. Background reference image
 * 2. Zone polygons (semi-transparent overlay areas)
 * 3. Existing defect markers (circles)
 * 4. Selected position marker (highlighted)
 * 5. Heatmap overlay (when enabled)
 *
 * Coordinate System:
 * - Uses pixel coordinates relative to the original image dimensions
 * - Automatically scales coordinates for display canvas size
 * - Maintains aspect ratio during resize operations
 *
 * Performance Considerations:
 * - Uses useImage hook for efficient image loading
 * - Implements viewport size tracking for responsive behavior
 * - Optimizes re-renders with dependency arrays
 * - Lazy loading of defect data
 *
 * @param {Object} props - Component props
 * @param {number} props.imageId - Database ID of the reference image
 * @param {string} props.imageUrl - URL/path to the image file
 * @param {Function} props.onClick - Callback when canvas is clicked: (position) => void
 * @param {Object} props.selectedPosition - Currently selected {x, y} position
 * @param {number} props.refreshKey - Increment to trigger defect data refresh
 * @param {Object} props.filters - Filter criteria for defect visibility
 * @param {number} props.maxWidthPercent - Maximum width as viewport percentage
 * @param {number} props.maxHeightPercent - Maximum height as viewport percentage
 * @param {string} props.zonefill - Zone polygon fill color
 * @param {string} props.defectfill - Defect marker fill color
 * @param {boolean} props.showHeatmap - Whether to show heatmap overlay
 * @param {number} props.hoveredDefectId - ID of currently hovered defect
 * @returns {JSX.Element} Canvas-based defect map interface
 */

import React, { useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Circle } from 'react-konva';
import useImage from 'use-image'; // Efficient image loading hook
import api from '../services/api';
import DefectHeatmapOverlay from './DefectHeatmapOverlay';
import config from '../utils/config';

/**
 * Custom hook to track viewport dimensions for responsive canvas sizing
 * @returns {Object} Current window dimensions {width, height}
 */
function useWindowDimensions() {
  const [dims, setDims] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const onResize = () =>
      setDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return dims;
}

/**
 * DefectMap Component
 *
 * Renders an interactive canvas with reference image, zones, and defects.
 * Handles user interactions and maintains coordinate system consistency.
 */
export default function DefectMap({
  imageId,
  imageUrl,
  onClick,
  selectedPosition,
  refreshKey,
  filters = {},
  maxWidthPercent = 0.75, // defaults to 75% of vw
  maxHeightPercent = 0.8, // defaults to 80% of vh
  zonefill = 'rgba(255,0,0,0.2)', // default to filled red
  defectfill = 'yellow', // default defect fill color
  showHeatmap = false, // default to show heatmap
  hoveredDefectId,
}) {
  // Build full URL for the image
  const imgSrc = config.getImageUrl(imageUrl);

  // Load the image
  const [img, status] = useImage(imgSrc, 'anonymous');

  // Fetch zones & defects
  const [zones, setZones] = useState([]);
  const [defects, setDefects] = useState([]);
  useEffect(() => {
    api.get(`/images/${imageId}/zones`).then((r) => {
      setZones(
        (r.data?.data || r.data || []).map((z) => ({
          ...z,
          polygon_coords:
            typeof z.polygon_coords === 'string'
              ? JSON.parse(z.polygon_coords)
              : z.polygon_coords,
        }))
      );
    });
    const params = { image_id: imageId };
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    api.get('/defects', { params }).then((r) => setDefects(r.data.data || []));
  }, [imageId, refreshKey, filters]);

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

  if (status !== 'loaded') return <p>Loading image…</p>;

  return (
    <div
      style={{
        position: 'relative',
        width: img.width * scale,
        height: img.height * scale,
        margin: '0 auto',
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
          transformOrigin: 'top left',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      >
        <Layer>
          <KonvaImage
            image={img}
            x={0}
            y={0}
            width={img.width}
            height={img.height}
          />
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
