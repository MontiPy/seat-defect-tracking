import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../services/api';
import { theme, commonStyles } from '../utils/theme';
import { CardSkeleton } from '../components/SkeletonLoader';

export default function ProjectEventsManager({
  projectId,
  refreshTrigger,
  editMode,
}) {
  // State management
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Form states
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
  });
  const [editEvent, setEditEvent] = useState({
    name: '',
    date: '',
  });

  // Fetch events for this project
  const fetchEvents = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const res = await api.get(`/build-events?project_id=${projectId}`);
      setEvents(res.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchEvents();
    }
  }, [projectId, refreshTrigger, fetchEvents]);

  const handleCreateEvent = async () => {
    try {
      const payload = {
        ...newEvent,
        project_id: parseInt(projectId),
      };

      await api.post('/build-events', payload);

      setNewEvent({ name: '', date: '' });
      setShowCreateDialog(false);
      fetchEvents();
    } catch (err) {
      console.error('Error creating event:', err);
      setError(
        `Failed to create event: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const handleUpdateEvent = async () => {
    try {
      await api.put(`/build-events/${selectedEvent.id}`, editEvent);
      setShowEditDialog(false);
      fetchEvents();
    } catch (err) {
      console.error('Error updating event:', err);
      setError(
        `Failed to update event: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await api.delete(`/build-events/${eventId}`);
      fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(
        `Failed to delete event: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const openEditDialog = (event) => {
    setSelectedEvent(event);
    setEditEvent({
      name: event.name,
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
    });
    setShowEditDialog(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

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
        <Typography variant="h6">Events Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowCreateDialog(true)}
        >
          Add Event
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {events.length === 0 ? (
        <Alert severity="info">
          No events found for this project. Click "Add Event" to get started.
        </Alert>
      ) : (
        <Box sx={commonStyles.managementGrid}>
          {events.map((event) => (
            <Card key={event.id} {...theme.cards.management}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box sx={{ flex: 1, pr: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {event.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(event.date)}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(event)}
                        title="Edit Event"
                      >
                        <Edit />
                      </IconButton>
                      {editMode && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteEvent(event.id)}
                          title="Delete Event"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Create Event Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              label="Event Name"
              fullWidth
              value={newEvent.name}
              onChange={(e) =>
                setNewEvent({ ...newEvent, name: e.target.value })
              }
              required
            />
            <TextField
              label="Event Date"
              type="date"
              fullWidth
              value={newEvent.date}
              onChange={(e) =>
                setNewEvent({ ...newEvent, date: e.target.value })
              }
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateEvent}
            variant="contained"
            disabled={!newEvent.name || !newEvent.date}
          >
            Create Event
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              label="Event Name"
              fullWidth
              value={editEvent.name}
              onChange={(e) =>
                setEditEvent({ ...editEvent, name: e.target.value })
              }
              required
            />
            <TextField
              label="Event Date"
              type="date"
              fullWidth
              value={editEvent.date}
              onChange={(e) =>
                setEditEvent({ ...editEvent, date: e.target.value })
              }
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateEvent}
            variant="contained"
            disabled={!editEvent.name || !editEvent.date}
          >
            Update Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
