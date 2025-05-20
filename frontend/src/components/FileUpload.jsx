import React, { useState } from 'react';
import api from '../services/api';

export default function FileUpload({ imageId, onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post(
        `/images/${imageId}/file`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // res.data contains { id, filename, url, created_at }
      onUpload(res.data.url);
    } catch (err) {
      console.error(err);
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded mb-4">
      <label className="block mb-2">
        Select Image:
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="mt-1"
        />
      </label>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {uploading ? 'Uploading…' : 'Upload Image'}
      </button>
    </div>
  );
}
