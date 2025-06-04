import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div style={{ padding: 24, textAlign: 'center' }}>
      <h2>Select a Project</h2>
      <div style={{ margin: '16px 0' }}>
        {projects.map((project) => (
          <button
            key={project.id}
            style={{
              margin: 8,
              padding: '12px 24px',
              fontSize: 16,
              borderRadius: 8,
              background: selectedProjectId === project.id ? '#1976d2' : '#eee',
              color: selectedProjectId === project.id ? 'white' : '#333',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => handleProjectSelect(project.id)}
          >
            {project.name}
          </button>
        ))}
      </div>
      {selectedProjectId && (
        <div>
          <button
            style={{ margin: 12, padding: '12px 24px', fontSize: 16 }}
            onClick={() => navigate(`/projects/${selectedProjectId}/entry-defect`, { state: { project: selectedProjectId } })}
          >
            Entry Defect Screen
          </button>
          <button
            style={{ margin: 12, padding: '12px 24px', fontSize: 16 }}
            onClick={() => navigate(`/projects/${selectedProjectId}/defects-review`, { state: { project: selectedProjectId } })}
          >
            Defects Review Screen
          </button>
          <button
            style={{ margin: 12, padding: '12px 24px', fontSize: 16 }}
            onClick={() => navigate(`/projects/${selectedProjectId}/zone-editor`, { state: { project: selectedProjectId } })}
          >
            Zone Editor
          </button>
        </div>
      )}
    </div>
  );
}

export default ProjectSelectPage;
