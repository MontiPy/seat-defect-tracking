// frontend/src/components/ReferenceImageGrid.jsx

import React from 'react';

export default function ReferenceImageGrid({ images }) {
  return (
    <div
      className="
        fixed inset-y-0 right-0
        w-1/2 h-screen
        p-4 bg-gray-50
        overflow-auto
      "
    >
      <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
        {images.slice(0, 4).map(img => (
          <div
            key={img.id}
            className="
              border border-gray-300
              rounded-lg
              overflow-hidden
            "
          >
            <img
              src={`${process.env.REACT_APP_API_URL}${img.url}`}
              alt={img.filename}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
