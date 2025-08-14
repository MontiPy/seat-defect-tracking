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
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../services/api';
import { theme, commonStyles } from '../utils/theme';
import { CardSkeleton } from '../components/SkeletonLoader';

export default function DefectTypesManager() {
  const [defectTypes, setDefectTypes] = useState([]);
  const [newDefectType, setNewDefectType] = useState({
    name: '',
    description: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const fetchDefectTypes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/defect-types');
      setDefectTypes(res.data?.data || res.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load defect types');
      console.error('Error fetching defect types:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefectTypes();
  }, []);

  const handleCreate = async () => {
    try {
      setCreating(true);
      await api.post('/defect-types', newDefectType);
      setNewDefectType({ name: '', description: '' });
      await fetchDefectTypes();
    } catch (err) {
      console.error('Error creating defect type:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async (id) => {
    await api.put(`/defect-types/${id}`, editValues[id]);
    setEditingId(null);
    fetchDefectTypes();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this defect type?')) {
      await api.delete(`/defect-types/${id}`);
      fetchDefectTypes();
    }
  };

  return (
    <Box sx={theme.layout.pageContainer}>
      <Typography {...theme.typography.pageTitle}>
        Manage Defect Types
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ ...theme.cards.default.sx, mb: 4 }}>
        <CardContent>
          <Typography {...theme.typography.sectionTitle}>
            Create New Defect Type
          </Typography>
          <Stack sx={commonStyles.responsiveStack}>
            <TextField
              label="Type Name"
              value={newDefectType.name}
              onChange={(e) =>
                setNewDefectType({ ...newDefectType, name: e.target.value })
              }
              required
              sx={{ minWidth: theme.forms.fieldMinWidth }}
            />
            <TextField
              label="Description"
              value={newDefectType.description}
              onChange={(e) =>
                setNewDefectType({
                  ...newDefectType,
                  description: e.target.value,
                })
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
            disabled={!newDefectType.name || creating}
          >
            {creating ? 'Creating...' : 'Add Defect Type'}
          </Button>
        </CardActions>
      </Card>

      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <>
          {defectTypes.length === 0 ? (
            <Alert severity="info">
              No defect types found. Create your first defect type above.
            </Alert>
          ) : (
            <Box sx={commonStyles.managementGrid}>
              {defectTypes.map((dt) => (
                <Card key={dt.id} {...theme.cards.management}>
                  <CardContent>
                    {editingId === dt.id ? (
                      <Stack sx={commonStyles.responsiveStack}>
                        <TextField
                          label="Type Name"
                          value={editValues[dt.id]?.name || ''}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              [dt.id]: {
                                ...editValues[dt.id],
                                name: e.target.value,
                              },
                            })
                          }
                          required
                          sx={{ minWidth: theme.forms.fieldMinWidth }}
                        />
                        <TextField
                          label="Description"
                          value={editValues[dt.id]?.description || ''}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              [dt.id]: {
                                ...editValues[dt.id],
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
                          {dt.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {dt.description || 'No description provided'}
                        </Typography>
                      </>
                    )}
                  </CardContent>

                  <CardActions>
                    {editingId === dt.id ? (
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleSave(dt.id)}
                          disabled={!editValues[dt.id]?.name}
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
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => {
                            setEditingId(dt.id);
                            setEditValues({
                              ...editValues,
                              [dt.id]: {
                                name: dt.name,
                                description: dt.description || '',
                              },
                            });
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDelete(dt.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    )}
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
