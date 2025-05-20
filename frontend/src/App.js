import React, { useEffect, useState } from 'react';
import api from './services/api';
import ReferenceImageGrid from './components/ReferenceImageGrid';
import DefectMap from './components/DefectMap';

export default function App() {
  const [images, setImages]     = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/images').then(r => setImages(r.data));
  }, []);

  return (
    <div className="flex">
      {/* LEFT HALF */}
      <div className="w-1/2 p-4">
        {selected ? (
          <DefectMap
            imageId={selected.id}
            imageUrl={selected.url}
            // …other props…
          />
        ) : (
          <p>Please select an image from the right ↓</p>
        )}
      </div>

      {/* RIGHT HALF */}
      <ReferenceImageGrid
        images={images}
        onSelect={img => setSelected(img)}
      />
    </div>
  );
}
