import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add, Edit, Delete, CloudUpload, EditOff } from '@mui/icons-material';
import api from '../services/api';
import { theme, commonStyles } from '../utils/theme';
import ProjectPartsManager from '../components/ProjectPartsManager';
import ProjectEventsManager from '../components/ProjectEventsManager';

// TabPanel component for project sections
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

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
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Upload Reference Images
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Button
          component="label"
          variant="outlined"
          startIcon={<CloudUpload />}
          sx={{ minWidth: 150 }}
        >
          Choose File
          <input
            type="file"
            hidden
            onChange={(e) => setFile(e.target.files[0])}
            accept="image/*"
          />
        </Button>
        {file && (
          <Typography variant="body2" color="text.secondary">
            {file.name}
          </Typography>
        )}
        <Button
          variant="contained"
          size="small"
          onClick={handleUpload}
          disabled={!file || uploading}
          startIcon={uploading ? <CircularProgress size={16} /> : null}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </Stack>
    </Box>
  );
}

function ProjectImages({ projectId, refreshTrigger, editMode }) {
  const [images, setImages] = useState([]);
  const baseUrl = api.defaults.baseURL.replace('/api', '');

  useEffect(() => {
    api
      .get(`/images?project_id=${projectId}`)
      .then((res) => setImages(res.data?.data || res.data || []));
  }, [projectId, refreshTrigger]);

  const handleDelete = async (id) => {
    await api.delete(`/images/${id}`);
    setImages((imgs) => imgs.filter((img) => img.id !== id));
  };

  return (
    <Box sx={{ mt: 2 }}>
      {images.length > 0 && (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Reference Images ({images.length})
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              mt: 1,
            }}
          >
            {images.map((img) => (
              <Card key={img.id} sx={{ width: 280 }}>
                <Box
                  sx={{
                    height: 160,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100',
                  }}
                >
                  <img
                    src={`${baseUrl}${img.url}`}
                    alt={img.filename}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </Box>
                <CardContent sx={{ pt: 1, pb: 1 }}>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {img.filename}
                  </Typography>
                </CardContent>
                {editMode && (
                  <CardActions sx={{ justifyContent: 'center', pt: 0 }}>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(img.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                )}
              </Card>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [newProj, setNewProj] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [activeProjectTabs, setActiveProjectTabs] = useState({}); // Track active tab per project
  const [editMode, setEditMode] = useState({}); // Track edit mode per project

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    try {
      setCreating(true);
      await api.post('/projects', newProj);
      setNewProj({ name: '', description: '' });
      await fetchProjects();
    } catch (err) {
      console.error('Error creating project:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async (id) => {
    await api.put(`/projects/${id}`, editValues[id]);
    setEditingId(null);
    fetchProjects();
  };

  const handleTabChange = (projectId, newValue) => {
    setActiveProjectTabs((prev) => ({
      ...prev,
      [projectId]: newValue,
    }));
  };

  const getActiveTab = (projectId) => {
    return activeProjectTabs[projectId] || 0;
  };

  const toggleEditMode = (projectId) => {
    setEditMode((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const isEditModeActive = (projectId) => {
    return editMode[projectId] || false;
  };

  return (
    <Box sx={theme.layout.pageContainer}>
      {/* Header Section - Fixed */}
      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <Typography {...theme.typography.pageTitle}>Manage Projects</Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Scrollable Content Section */}
      <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto' }}>
        <Card sx={{ ...theme.cards.default.sx, mb: 4 }}>
          <CardContent>
            <Typography {...theme.typography.sectionTitle}>
              Create New Project
            </Typography>
            <Stack sx={commonStyles.responsiveStack}>
              <TextField
                label="Project Name"
                value={newProj.name}
                onChange={(e) =>
                  setNewProj({ ...newProj, name: e.target.value })
                }
                required
                sx={{ minWidth: theme.forms.fieldMinWidth }}
              />
              <TextField
                label="Description"
                value={newProj.description}
                onChange={(e) =>
                  setNewProj({ ...newProj, description: e.target.value })
                }
                sx={{ minWidth: theme.forms.fieldMinWidth }}
              />
            </Stack>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              startIcon={creating ? <CircularProgress size={20} /> : <Add />}
              onClick={handleCreate}
              disabled={!newProj.name || creating}
            >
              {creating ? 'Creating...' : 'Add Project'}
            </Button>
          </CardActions>
        </Card>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {projects.map((p) => (
              <Card key={p.id} {...theme.cards.default}>
                <CardContent>
                  {editingId === p.id ? (
                    <Stack sx={commonStyles.responsiveStack}>
                      <TextField
                        label="Project Name"
                        value={editValues[p.id]?.name || ''}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            [p.id]: {
                              ...editValues[p.id],
                              name: e.target.value,
                            },
                          })
                        }
                        required
                        sx={{ minWidth: theme.forms.fieldMinWidth }}
                      />
                      <TextField
                        label="Description"
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
                        sx={{ minWidth: theme.forms.fieldMinWidth }}
                      />
                    </Stack>
                  ) : (
                    <>
                      <Typography variant="h6" gutterBottom>
                        {p.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {p.description || 'No description provided'}
                      </Typography>
                    </>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* Project Management Tabs */}
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Tabs
                        value={getActiveTab(p.id)}
                        onChange={(e, newValue) =>
                          handleTabChange(p.id, newValue)
                        }
                        aria-label="project management tabs"
                      >
                        <Tab label="Images" />
                        <Tab label="Parts" />
                        <Tab label="Events" />
                      </Tabs>
                      <Tooltip
                        title={
                          isEditModeActive(p.id)
                            ? 'Disable delete actions'
                            : 'Enable delete actions'
                        }
                      >
                        <IconButton
                          size="small"
                          color={isEditModeActive(p.id) ? 'primary' : 'default'}
                          onClick={() => toggleEditMode(p.id)}
                        >
                          {isEditModeActive(p.id) ? <Edit /> : <EditOff />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  <TabPanel value={getActiveTab(p.id)} index={0}>
                    <ImageUploader
                      projectId={p.id}
                      onUploaded={() => setRefreshTrigger((prev) => prev + 1)}
                    />
                    <ProjectImages
                      projectId={p.id}
                      refreshTrigger={refreshTrigger}
                      editMode={isEditModeActive(p.id)}
                    />
                  </TabPanel>

                  <TabPanel value={getActiveTab(p.id)} index={1}>
                    <ProjectPartsManager
                      projectId={p.id}
                      refreshTrigger={refreshTrigger}
                      editMode={isEditModeActive(p.id)}
                    />
                  </TabPanel>

                  <TabPanel value={getActiveTab(p.id)} index={2}>
                    <ProjectEventsManager
                      projectId={p.id}
                      refreshTrigger={refreshTrigger}
                      editMode={isEditModeActive(p.id)}
                    />
                  </TabPanel>
                </CardContent>

                <CardActions>
                  {editingId === p.id ? (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSave(p.id)}
                        disabled={!editValues[p.id]?.name}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => {
                        setEditingId(p.id);
                        setEditValues({
                          ...editValues,
                          [p.id]: {
                            name: p.name,
                            description: p.description || '',
                          },
                        });
                      }}
                    >
                      Edit Project
                    </Button>
                  )}
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
