import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Link,
  Close,
  Image as ImageIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { theme, commonStyles } from '../utils/theme';
import { CardSkeleton } from '../components/SkeletonLoader';

export default function ProjectPartsManager({
  projectId,
  refreshTrigger,
  editMode,
}) {
  // State management
  const [parts, setParts] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLinkImageDialog, setShowLinkImageDialog] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);

  // Form states
  const [newPart, setNewPart] = useState({
    seat_part_number: '',
    description: '',
  });
  const [editPart, setEditPart] = useState({
    seat_part_number: '',
    description: '',
  });

  // Fetch parts for this project
  const fetchParts = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const res = await api.get(`/parts?project_id=${projectId}`);

      // Fetch detailed information for each part including linked images
      const partsWithImages = await Promise.all(
        (res.data.data || []).map(async (part) => {
          try {
            const partDetailRes = await api.get(`/parts/${part.id}`);
            return partDetailRes.data.data || part;
          } catch (err) {
            console.error(`Error fetching details for part ${part.id}:`, err);
            return part; // Fallback to basic part info
          }
        })
      );

      setParts(partsWithImages);
      setError(null);
    } catch (err) {
      setError('Failed to load parts');
      console.error('Error fetching parts:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Fetch available images for this project
  const fetchImages = useCallback(async () => {
    if (!projectId) return;

    try {
      const res = await api.get(`/images?project_id=${projectId}`);
      setImages(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Error fetching images:', err);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchParts();
      fetchImages();
    }
  }, [projectId, refreshTrigger, fetchParts, fetchImages]);

  const handleCreatePart = async () => {
    try {
      const payload = {
        ...newPart,
        project_id: parseInt(projectId),
      };

      await api.post('/parts', payload);

      setNewPart({ seat_part_number: '', description: '' });
      setShowCreateDialog(false);
      fetchParts();
    } catch (err) {
      console.error('Error creating part:', err);
      setError(
        `Failed to create part: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const handleUpdatePart = async () => {
    try {
      await api.put(`/parts/${selectedPart.id}`, editPart);
      setShowEditDialog(false);
      fetchParts();
    } catch (err) {
      console.error('Error updating part:', err);
    }
  };

  const handleDeletePart = async (partId) => {
    if (!window.confirm('Are you sure you want to delete this part?')) return;

    try {
      await api.delete(`/parts/${partId}`);
      fetchParts();
    } catch (err) {
      console.error('Error deleting part:', err);
    }
  };

  const openEditDialog = (part) => {
    setSelectedPart(part);
    setEditPart({
      seat_part_number: part.seat_part_number,
      description: part.description || '',
    });
    setShowEditDialog(true);
  };

  const openLinkImageDialog = (part) => {
    setSelectedPart(part);
    setSelectedImages([]);
    setShowLinkImageDialog(true);
  };

  const handleImageSelection = (imageId, checked) => {
    if (checked) {
      setSelectedImages((prev) => [...prev, imageId]);
    } else {
      setSelectedImages((prev) => prev.filter((id) => id !== imageId));
    }
  };

  const handleLinkImages = async () => {
    if (!selectedPart || selectedImages.length === 0) return;

    try {
      await Promise.all(
        selectedImages.map((imageId) =>
          api.post(`/parts/${selectedPart.id}/images`, { image_id: imageId })
        )
      );

      setShowLinkImageDialog(false);
      setSelectedImages([]);
      fetchParts();
      fetchImages();
    } catch (err) {
      console.error('Error linking images:', err);
    }
  };

  const handleUnlinkImage = async (partId, imageId) => {
    try {
      await api.delete(`/parts/${partId}/images/${imageId}`);
      fetchParts();
      fetchImages();
    } catch (err) {
      console.error('Error unlinking image:', err);
    }
  };

  const baseUrl = api.defaults.baseURL.replace('/api', '');

  if (loading) {
    return <CardSkeleton count={3} />;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h6">Parts Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowCreateDialog(true)}
        >
          Add Part
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {parts.length === 0 ? (
        <Alert severity="info">
          No parts found for this project. Click "Add Part" to get started.
        </Alert>
      ) : (
        <Box sx={commonStyles.managementGrid}>
          {parts.map((part) => (
            <Card key={part.id} {...theme.cards.management}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box sx={{ flex: 1, pr: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {part.seat_part_number}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {part.description || 'No description provided'}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(part)}
                        title="Edit Part"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openLinkImageDialog(part)}
                        title="Link Images"
                      >
                        <Link />
                      </IconButton>
                      {editMode && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeletePart(part.id)}
                          title="Delete Part"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Stack>
                  </Stack>

                  {part.images && part.images.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Linked Images ({part.images.length})
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 0.5,
                        }}
                      >
                        {part.images.map((img) => (
                          <Chip
                            key={img.id}
                            label={img.filename}
                            size="small"
                            icon={<ImageIcon />}
                            onDelete={() => handleUnlinkImage(part.id, img.id)}
                            deleteIcon={<Close />}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Create Part Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Part</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              label="Part Number"
              fullWidth
              value={newPart.seat_part_number}
              onChange={(e) =>
                setNewPart({ ...newPart, seat_part_number: e.target.value })
              }
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newPart.description}
              onChange={(e) =>
                setNewPart({ ...newPart, description: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreatePart}
            variant="contained"
            disabled={!newPart.seat_part_number}
          >
            Create Part
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Part Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Part</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              label="Part Number"
              fullWidth
              value={editPart.seat_part_number}
              onChange={(e) =>
                setEditPart({ ...editPart, seat_part_number: e.target.value })
              }
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={editPart.description}
              onChange={(e) =>
                setEditPart({ ...editPart, description: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdatePart}
            variant="contained"
            disabled={!editPart.seat_part_number}
          >
            Update Part
          </Button>
        </DialogActions>
      </Dialog>

      {/* Link Images Dialog */}
      <Dialog
        open={showLinkImageDialog}
        onClose={() => setShowLinkImageDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Link Images to Part: {selectedPart?.seat_part_number}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Typography variant="subtitle2">
              Select Images to Link ({selectedImages.length} selected)
            </Typography>

            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {images.filter((img) => !img.part_id).length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 4 }}
                >
                  No unlinked images available. Upload images first or unlink
                  existing images.
                </Typography>
              ) : (
                <List>
                  {images
                    .filter((img) => !img.part_id) // Only show unlinked images
                    .map((img) => {
                      const isSelected = selectedImages.includes(img.id);

                      return (
                        <ListItem key={img.id} dense>
                          <ListItemIcon>
                            <Checkbox
                              checked={isSelected}
                              onChange={(e) =>
                                handleImageSelection(img.id, e.target.checked)
                              }
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={img.filename}
                            secondary={`Uploaded: ${new Date(img.created_at).toLocaleDateString()}`}
                          />
                          <Box
                            sx={{
                              width: 60,
                              height: 40,
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.100',
                              borderRadius: 1,
                              ml: 2,
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
                        </ListItem>
                      );
                    })}
                </List>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLinkImageDialog(false)}>Cancel</Button>
          <Button
            onClick={handleLinkImages}
            variant="contained"
            disabled={selectedImages.length === 0}
          >
            Link Selected Images ({selectedImages.length})
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
