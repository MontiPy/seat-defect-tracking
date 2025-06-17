import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import api from '../services/api'; // Adjust path if needed

function ProjectSelectPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data));
  }, []);

  const handleProjectSelect = (id) => setSelectedProjectId(id);

  return (
    <Box sx={{ p: 3, textAlign: 'center', height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Select a Project
      </Typography>
      <Button variant="outlined" sx={{ mb: 2 }} onClick={() => navigate('/manage-projects')}>
        Manage Projects
      </Button>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        flexWrap="wrap"
        sx={{ my: 2 }}
      >

        {projects.map((project) => (
          <Button
            key={project.id}
            variant={selectedProjectId === project.id ? "contained" : "outlined"}
            onClick={() => handleProjectSelect(project.id)}
            sx={{ m: 1 }}
          >
            {project.name}
          </Button>
        ))}
      </Stack>
      {selectedProjectId && (
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          onClick={() =>
            navigate(`/projects/${selectedProjectId}/entry-defect`, {
              state: { project: selectedProjectId },
            })
          }
          >
            Entry Defect Screen
            </Button>
          <Button
            variant="outlined"
            onClick={() =>
              navigate(`/projects/${selectedProjectId}/defects-review`, {
                state: { project: selectedProjectId },
              })
            }
          >
            Defects Review Screen
            </Button>
        <Button
          variant="outlined"
          onClick={() =>
            navigate(`/projects/${selectedProjectId}/zone-editor`, {
              state: { project: selectedProjectId },
            })
          }
        >
          Zone Editor
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            navigate(`/projects/${selectedProjectId}/pareto`, {
              state: { project: selectedProjectId },
            })
          }
        >
          Pareto Chart
        </Button>
        </Stack>
      )}
    </Box>
  );
}

export default ProjectSelectPage;
