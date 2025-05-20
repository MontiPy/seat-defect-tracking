// frontend/src/components/ImageSelector.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ImageSelector({ onSelect }) {
  const [imgs, setImgs] = useState([]);
  useEffect(() => {
    api.get('/images').then(r => setImgs(r.data));
  }, []);
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {imgs.map(img => (
        <div
          key={img.id}
          onClick={() => onSelect(img)}
          className="cursor-pointer border rounded overflow-hidden"
        >
          <img
            src={`${process.env.REACT_APP_API_URL}${img.url}`}
            alt={img.filename}
            className="w-full h-auto"
          />
          <p className="text-center py-1">{img.filename}</p>
        </div>
      ))}
    </div>
  );
}
