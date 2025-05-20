// frontend/src/components/ReferenceImageGrid.jsx

import React from 'react';

export default function ReferenceImageGrid({ images, onSelect }) {
  return (
    <div className="w-1/2 p-4 bg-gray-50 h-screen overflow-auto flex items-center justify-center">
      <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full max-h-full">
        {images.slice(0, 4).map(img => (
          <div
            key={img.id}
            className="border border-gray-300 rounded-lg overflow-hidden aspect-square flex items-center justify-center cursor-pointer"
            onClick={() => onSelect && onSelect(img)}
          >
            <img
              src={`${process.env.REACT_APP_API_URL}${img.url}`}
              alt={img.filename}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
