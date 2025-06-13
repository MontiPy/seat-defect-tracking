import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Stack } from '@mui/material';
import api from '../services/api';

function ImageUploader({ projectId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('image', file);
    form.append('project_id', projectId);
    try {
      const res = await api.post('/images', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploaded && onUploaded(res.data);
      setFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        accept="image/*"
      />
      <Button variant="outlined" size="small" onClick={handleUpload} disabled={!file || uploading}>
        Upload
      </Button>
    </Box>
  );
}

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [newProj, setNewProj] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const fetchProjects = () => {
    api.get('/projects').then((res) => setProjects(res.data));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    await api.post('/projects', newProj);
    setNewProj({ name: '', description: '' });
    fetchProjects();
  };

  const handleSave = async (id) => {
    await api.put(`/projects/${id}`, editValues[id]);
    setEditingId(null);
    fetchProjects();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Manage Projects
      </Typography>
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Name"
          size="small"
          value={newProj.name}
          onChange={(e) => setNewProj({ ...newProj, name: e.target.value })}
          sx={{ mr: 1 }}
        />
        <TextField
          label="Description"
          size="small"
          value={newProj.description}
          onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
          sx={{ mr: 1 }}
        />
        <Button variant="contained" onClick={handleCreate} disabled={!newProj.name}>
          Add Project
        </Button>
      </Box>
      <Stack spacing={2}>
        {projects.map((p) => (
          <Box key={p.id} sx={{ border: '1px solid #ccc', p: 2 }}>
            {editingId === p.id ? (
              <>
                <TextField
                  label="Name"
                  size="small"
                  value={editValues[p.id]?.name || ''}
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      [p.id]: { ...editValues[p.id], name: e.target.value },
                    })
                  }
                  sx={{ mr: 1 }}
                />
                <TextField
                  label="Description"
                  size="small"
                  value={editValues[p.id]?.description || ''}
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      [p.id]: {
                        ...editValues[p.id],
                        description: e.target.value,
                      },
                    })
                  }
                  sx={{ mr: 1 }}
                />
                <Button variant="contained" size="small" onClick={() => handleSave(p.id)}>
                  Save
                </Button>
              </>
            ) : (
              <>
                <Typography variant="subtitle1">{p.name}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {p.description}
                </Typography>
                <Button variant="outlined" size="small" onClick={() => {
                  setEditingId(p.id);
                  setEditValues({ ...editValues, [p.id]: { name: p.name, description: p.description } });
                }} sx={{ mr: 1 }}>
                  Edit
                </Button>
              </>
            )}
            <ImageUploader projectId={p.id} onUploaded={() => fetchProjects()} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
