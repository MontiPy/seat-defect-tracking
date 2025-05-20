import React, { useState, useEffect } from 'react';
import { Stage, Layer, Image as KImage, Line, Circle } from 'react-konva';
import useImage from 'use-image';
import api from '../services/api';
import DefectFormModal from './DefectFormModal';

export default function DefectMap({ imageId }) {
  const [zones, setZones] = useState([]);
  const [defects, setDefects] = useState([]);
  const [img] = useImage(`/api/images/${imageId}/file`);
  const [modalPos, setModalPos] = useState(null);

  useEffect(() => {
    api.get(`/images/${imageId}/zones`).then(r => setZones(r.data));
    api.get(`/images/${imageId}/defects`).then(r => setDefects(r.data));
  }, [imageId]);

  const handleClick = e => {
    const pos = e.target.getStage().getPointerPosition();
    setModalPos(pos);
  };

  const handleSave = formData => {
    api.post('/defects', {
      image_id: imageId,
      x: modalPos.x,
      y: modalPos.y,
      ...formData,
    }).then(r => {
      setDefects(ds => [...ds, r.data]);
      setModalPos(null);
    });
  };

  return (
    <>
      <Stage width={800} height={600} onClick={handleClick}>
        <Layer>
          <KImage image={img} />
          {zones.map(z => (
            <Line
              key={z.id}
              points={z.polygon_coords.flatMap(p => [p.x, p.y])}
              closed
              opacity={0.2}
              fill="red"
              stroke="darkred"
            />
          ))}
          {defects.map(d => (
            <Circle key={d.id} x={d.x} y={d.y} radius={6} fill="yellow" stroke="black" />
          ))}
        </Layer>
      </Stage>
      {modalPos && (
        <DefectFormModal
          position={modalPos}
          zones={zones}
          onSave={handleSave}
          onCancel={() => setModalPos(null)}
        />
      )}
    </>
  );
}
