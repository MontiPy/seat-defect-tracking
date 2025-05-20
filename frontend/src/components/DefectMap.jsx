// frontend/src/components/DefectMap.jsx

import React, { useState, useEffect } from 'react';
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Line,
  Circle,
} from 'react-konva';
import useImage from 'use-image';
import api from '../services/api';
import DefectFormModal from './DefectFormModal';

// custom hook to track window dimensions
function useWindowDimensions() {
  const [dims, setDims] = useState({
    width:  window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDims({
        width:  window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return dims;
}

export default function DefectMap({ imageId, imageUrl }) {
  // 1) Build absolute URL
  const imgSrc = imageUrl.startsWith('http')
    ? imageUrl
    : `${process.env.REACT_APP_API_URL}${imageUrl}`;

  // 2) Load the image
  const [img, status] = useImage(imgSrc);

  // 3) Track window size and derive maxWidth = 50% of viewport
  const { width: vw, height: vh } = useWindowDimensions();
  const maxWidth  = vw * 0.5;      // 50% of screen width
  const maxHeight = vh * 0.8;      // e.g. up to 80% of screen height

  // 4) Compute scale once image loads
  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (img) {
      const scaleX = maxWidth  / img.width;
      const scaleY = maxHeight / img.height;
      setScale(Math.min(scaleX, scaleY, 1));
    }
  }, [img, maxWidth, maxHeight]);

  // 5) Fetch zones & defects
  const [zones, setZones]     = useState([]);
  const [defects, setDefects] = useState([]);
  useEffect(() => {
    api.get(`/images/${imageId}/zones`).then(r => setZones(r.data));
    api.get(`/images/${imageId}/defects`).then(r => setDefects(r.data));
  }, [imageId]);

  // 6) Handle click (convert back to original coords)
  const [modalPos, setModalPos] = useState(null);
  const handleStageClick = e => {
    const { x, y } = e.target.getStage().getPointerPosition();
    setModalPos({ x: x / scale, y: y / scale });
  };

  // 7) Save defect
  const handleSave = formData => {
    api.post('/defects', {
      image_id:       imageId,
      zone_id:        formData.zone_id,
      x:              modalPos.x,
      y:              modalPos.y,
      cbu:            formData.cbu,
      part_id:        formData.part_id,
      build_event_id: formData.build_event_id,
      noted_by:       formData.noted_by,
    }).then(r => {
      setDefects(ds => [...ds, r.data]);
      setModalPos(null);
    });
  };

  // 8) Render
  return (
    <>
      {status !== 'loaded' && <p>Loading image…</p>}

      {status === 'loaded' && (
        <Stage
          width={maxWidth}
          height={maxHeight}
          onClick={handleStageClick}
          style={{
            // center it, optional padding
            margin: '0 auto',
            display: 'block',
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

            {zones.map(z => (
              <Line
                key={z.id}
                points={z.polygon_coords.flatMap(p => [
                  p.x * scale,
                  p.y * scale,
                ])}
                closed
                opacity={0.2}
                fill="red"
                stroke="darkred"
              />
            ))}

            {defects.map(d => (
              <Circle
                key={d.id}
                x={d.x * scale}
                y={d.y * scale}
                radius={6}
                fill="yellow"
                stroke="black"
              />
            ))}
          </Layer>
        </Stage>
      )}

      {modalPos && (
        <DefectFormModal
          initialPosition={{
            x: modalPos.x * scale,
            y: modalPos.y * scale,
          }}
          zones={zones}
          onSave={handleSave}
          onCancel={() => setModalPos(null)}
        />
      )}
    </>
  );
}
