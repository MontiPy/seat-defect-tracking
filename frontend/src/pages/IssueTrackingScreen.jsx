import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add,
  Edit,
  FilterList,
  Refresh,
  Link,
  Close,
  Delete,
  Visibility,
  ViewColumn,
  DragIndicator,
  Settings,
} from '@mui/icons-material';
import api from '../services/api';
import { theme } from '../utils/theme';

// Issue priority and severity colors
const getPriorityColor = (priority) => {
  const colors = {
    urgent: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success',
  };
  return colors[priority] || 'default';
};

const getSeverityColor = (severity) => {
  const colors = {
    critical: 'error',
    major: 'warning',
    minor: 'info',
    cosmetic: 'success',
  };
  return colors[severity] || 'default';
};

const getStatusColor = (status) => {
  const colors = {
    open: 'error',
    in_progress: 'warning',
    resolved: 'success',
    closed: 'default',
    rejected: 'default',
  };
  return colors[status] || 'default';
};

export default function IssueTrackingScreen() {
  const { projectId } = useParams();

  // State management
  const [issues, setIssues] = useState([]);
  const [parts, setParts] = useState([]);
  const [defects, setDefects] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLinkDefectDialog, setShowLinkDefectDialog] = useState(false);
  const [selectedDefects, setSelectedDefects] = useState([]);
  const [defectFilters, setDefectFilters] = useState({
    zone: '',
    part: '',
    type: '',
    search: '',
  });
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    priority: '',
    assigned_to: '',
  });

  // Column configuration state
  const [columnConfig, setColumnConfig] = useState([
    { key: 'issue_number', label: 'Issue #', visible: true, width: 100 },
    { key: 'title', label: 'Title', visible: true, width: 200 },
    { key: 'issue_type', label: 'Type', visible: true, width: 120 },
    { key: 'status', label: 'Status', visible: true, width: 120 },
    { key: 'severity', label: 'Severity', visible: true, width: 120 },
    { key: 'priority', label: 'Priority', visible: true, width: 120 },
    { key: 'assigned_to', label: 'Assigned To', visible: true, width: 150 },
    { key: 'created_at', label: 'Created', visible: true, width: 120 },
    { key: 'due_date', label: 'Due Date', visible: false, width: 120 },
    { key: 'supplier_name', label: 'Supplier', visible: false, width: 150 },
    { key: 'reported_by', label: 'Reported By', visible: false, width: 150 },
    { key: 'actions', label: 'Actions', visible: true, width: 160 },
  ]);
  const [showColumnDialog, setShowColumnDialog] = useState(false);

  // New issue form state
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    issue_type: 'supplier',
    severity: 'minor',
    priority: 'medium',
    assigned_to: '',
    reported_by: '',
    supplier_name: '',
    part_id: '',
    due_date: '',
  });

  // Edit issue form state
  const [editIssue, setEditIssue] = useState({
    title: '',
    description: '',
    issue_type: 'supplier',
    severity: 'minor',
    priority: 'medium',
    status: 'open',
    assigned_to: '',
    reported_by: '',
    supplier_name: '',
    part_id: '',
    due_date: '',
    root_cause: '',
    corrective_action: '',
  });

  // Fetch data functions
  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ project_id: projectId, ...filters });
      const res = await api.get(`/issues?${params}`);
      setIssues(res.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load issues');
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get(`/issues/stats?project_id=${projectId}`);
      setStats(res.data.data || {});
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [projectId]);

  const fetchParts = useCallback(async () => {
    try {
      const res = await api.get('/parts');
      setParts(res.data.data || []);
    } catch (err) {
      console.error('Error fetching parts:', err);
    }
  }, []);

  const fetchIssueDetails = async (issueId) => {
    try {
      const res = await api.get(`/issues/${issueId}`);
      setSelectedIssue(res.data.data);
      setShowDetailDialog(true);
    } catch (err) {
      console.error('Error fetching issue details:', err);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchIssues();
      fetchStats();
      fetchParts();
    }
  }, [projectId, filters, fetchIssues, fetchStats, fetchParts]);

  useEffect(() => {
    if (showLinkDefectDialog && projectId) {
      // When fetching defects for linking, only show unlinked defects
      const params = new URLSearchParams({
        project_id: projectId,
        unlinked: 'true',
        ...defectFilters,
      });
      api
        .get(`/defects?${params}`)
        .then((res) => setDefects(res.data.data || []))
        .catch((err) => console.error('Error fetching unlinked defects:', err));
    }
  }, [showLinkDefectDialog, projectId, defectFilters]);

  // Handle create issue
  const handleCreateIssue = async () => {
    try {
      const payload = {
        ...newIssue,
        project_id: parseInt(projectId),
      };
      await api.post('/issues', payload);

      // Reset form state
      setNewIssue({
        title: '',
        description: '',
        issue_type: 'supplier',
        severity: 'minor',
        priority: 'medium',
        assigned_to: '',
        reported_by: '',
        supplier_name: '',
        part_id: '',
        due_date: '',
      });
      setShowCreateDialog(false);
      fetchIssues();
      fetchStats();
    } catch (err) {
      console.error('Error creating issue:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      severity: '',
      priority: '',
      assigned_to: '',
    });
  };

  const clearDefectFilters = () => {
    setDefectFilters({
      zone: '',
      part: '',
      type: '',
      search: '',
    });
  };

  const handleDefectFilterChange = (field, value) => {
    setDefectFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleDefectSelection = (defectId, checked) => {
    if (checked) {
      setSelectedDefects((prev) => [...prev, defectId]);
    } else {
      setSelectedDefects((prev) => prev.filter((id) => id !== defectId));
    }
  };

  const handleLinkDefects = async () => {
    if (!selectedIssue || selectedDefects.length === 0) return;

    try {
      await Promise.all(
        selectedDefects.map((defectId) =>
          api.post(`/issues/${selectedIssue.id}/defects`, {
            defect_id: defectId,
            relationship_type: 'related_to',
            created_by: 'Current User', // Replace with actual user
          })
        )
      );

      setShowLinkDefectDialog(false);
      setSelectedDefects([]);
      fetchIssueDetails(selectedIssue.id); // Refresh issue details
    } catch (err) {
      console.error('Error linking defects:', err);
    }
  };

  const handleUnlinkDefect = async (defectId) => {
    if (!selectedIssue) return;

    try {
      await api.delete(`/issues/${selectedIssue.id}/defects/${defectId}`);
      fetchIssueDetails(selectedIssue.id); // Refresh issue details
    } catch (err) {
      console.error('Error unlinking defect:', err);
    }
  };

  const openLinkDefectDialog = (issue) => {
    setSelectedIssue(issue);
    setSelectedDefects([]);
    setShowLinkDefectDialog(true);
  };

  const openEditDialog = (issue) => {
    setSelectedIssue(issue);
    setEditIssue({
      title: issue.title || '',
      description: issue.description || '',
      issue_type: issue.issue_type || 'supplier',
      severity: issue.severity || 'minor',
      priority: issue.priority || 'medium',
      status: issue.status || 'open',
      assigned_to: issue.assigned_to || '',
      reported_by: issue.reported_by || '',
      supplier_name: issue.supplier_name || '',
      part_id: issue.part_id || '',
      due_date: issue.due_date || '',
      root_cause: issue.root_cause || '',
      corrective_action: issue.corrective_action || '',
    });
    setShowEditDialog(true);
  };

  const handleEditIssue = async () => {
    if (!selectedIssue) return;

    try {
      await api.put(`/issues/${selectedIssue.id}`, editIssue);
      setShowEditDialog(false);
      fetchIssues();
      fetchStats();
    } catch (err) {
      console.error('Error updating issue:', err);
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this issue? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await api.delete(`/issues/${issueId}`);
      fetchIssues();
      fetchStats();
    } catch (err) {
      console.error('Error deleting issue:', err);
    }
  };

  // Column management functions
  const handleColumnVisibilityChange = (columnKey, visible) => {
    setColumnConfig((prev) =>
      prev.map((col) => (col.key === columnKey ? { ...col, visible } : col))
    );
  };

  const handleColumnReorder = (fromIndex, toIndex) => {
    setColumnConfig((prev) => {
      const newConfig = [...prev];
      const [removed] = newConfig.splice(fromIndex, 1);
      newConfig.splice(toIndex, 0, removed);
      return newConfig;
    });
  };

  // Drag and drop state for column reordering
  const [dragState, setDragState] = useState({
    draggedIndex: null,
    dragOverIndex: null,
  });

  const handleDragStart = (index) => {
    setDragState({ draggedIndex: index, dragOverIndex: null });
  };

  const handleDragOver = (index) => {
    if (dragState.draggedIndex !== null && dragState.draggedIndex !== index) {
      setDragState((prev) => ({ ...prev, dragOverIndex: index }));
    }
  };

  const handleDragEnd = () => {
    if (dragState.draggedIndex !== null && dragState.dragOverIndex !== null) {
      handleColumnReorder(dragState.draggedIndex, dragState.dragOverIndex);
    }
    setDragState({ draggedIndex: null, dragOverIndex: null });
  };

  const visibleColumns = columnConfig.filter((col) => col.visible);

  const renderTableCell = (issue, column) => {
    switch (column.key) {
      case 'issue_number':
        return issue.issue_number;
      case 'title':
        return (
          <Typography
            variant="body2"
            sx={{
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={() => fetchIssueDetails(issue.id)}
          >
            {issue.title}
          </Typography>
        );
      case 'issue_type':
        return (
          <Chip label={issue.issue_type} size="small" variant="outlined" />
        );
      case 'status':
        return (
          <Chip
            label={issue.status}
            size="small"
            color={getStatusColor(issue.status)}
          />
        );
      case 'severity':
        return (
          <Chip
            label={issue.severity}
            size="small"
            color={getSeverityColor(issue.severity)}
          />
        );
      case 'priority':
        return (
          <Chip
            label={issue.priority}
            size="small"
            color={getPriorityColor(issue.priority)}
          />
        );
      case 'assigned_to':
        return issue.assigned_to || 'Unassigned';
      case 'created_at':
        return new Date(issue.created_at).toLocaleDateString();
      case 'due_date':
        return issue.due_date
          ? new Date(issue.due_date).toLocaleDateString()
          : 'N/A';
      case 'supplier_name':
        return issue.supplier_name || 'N/A';
      case 'reported_by':
        return issue.reported_by || 'N/A';
      case 'actions':
        return (
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              onClick={() => fetchIssueDetails(issue.id)}
              title="View Details"
            >
              <Visibility />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => openEditDialog(issue)}
              title="Edit Issue"
            >
              <Edit />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => openLinkDefectDialog(issue)}
              title="Link Defects"
            >
              <Link />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteIssue(issue.id)}
              title="Delete Issue"
            >
              <Delete />
            </IconButton>
          </Stack>
        );
      default:
        return issue[column.key] || 'N/A';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={theme.layout.pageContainer}>
      <Typography {...theme.typography.pageTitle}>Issue Tracking</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ minWidth: 150 }}>
          <CardContent sx={{ textAlign: 'center', pb: '16px !important' }}>
            <Typography variant="h4" color="primary">
              {stats.total || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Issues
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 150 }}>
          <CardContent sx={{ textAlign: 'center', pb: '16px !important' }}>
            <Typography variant="h4" color="error">
              {stats.open || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Open
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 150 }}>
          <CardContent sx={{ textAlign: 'center', pb: '16px !important' }}>
            <Typography variant="h4" color="warning.main">
              {stats.in_progress || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In Progress
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 150 }}>
          <CardContent sx={{ textAlign: 'center', pb: '16px !important' }}>
            <Typography variant="h4" color="success.main">
              {stats.resolved || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resolved
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Action Bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowCreateDialog(true)}
          >
            New Issue
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              fetchIssues();
              fetchStats();
            }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<ViewColumn />}
            onClick={() => setShowColumnDialog(true)}
          >
            Columns
          </Button>
        </Stack>

        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={filters.severity}
              label="Severity"
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="major">Major</MenuItem>
              <MenuItem value="minor">Minor</MenuItem>
              <MenuItem value="cosmetic">Cosmetic</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </Stack>
      </Stack>

      {/* Issues Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableCell
                  key={column.key}
                  sx={{
                    width: column.width,
                    position: 'relative',
                    '&:hover .drag-handle': {
                      opacity: 1,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {column.label}
                    <IconButton
                      size="small"
                      className="drag-handle"
                      sx={{
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        cursor: 'grab',
                        '&:active': { cursor: 'grabbing' },
                      }}
                      onMouseDown={(e) => {
                        // Simple drag implementation placeholder
                        console.log('Drag started for column:', column.key);
                      }}
                    >
                      <DragIndicator fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id} hover>
                {visibleColumns.map((column) => (
                  <TableCell key={`${issue.id}-${column.key}`}>
                    {renderTableCell(issue, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {issues.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No issues found for this project.
        </Alert>
      )}

      {/* Create Issue Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Create New Issue</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              value={newIssue.title}
              onChange={(e) =>
                setNewIssue({ ...newIssue, title: e.target.value })
              }
              required
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newIssue.description}
              onChange={(e) =>
                setNewIssue({ ...newIssue, description: e.target.value })
              }
            />

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Issue Type</InputLabel>
                <Select
                  value={newIssue.issue_type}
                  label="Issue Type"
                  onChange={(e) =>
                    setNewIssue({ ...newIssue, issue_type: e.target.value })
                  }
                >
                  <MenuItem value="supplier">Supplier</MenuItem>
                  <MenuItem value="manufacturing">Manufacturing</MenuItem>
                  <MenuItem value="design">Design</MenuItem>
                  <MenuItem value="quality">Quality</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={newIssue.severity}
                  label="Severity"
                  onChange={(e) =>
                    setNewIssue({ ...newIssue, severity: e.target.value })
                  }
                >
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="major">Major</MenuItem>
                  <MenuItem value="minor">Minor</MenuItem>
                  <MenuItem value="cosmetic">Cosmetic</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newIssue.priority}
                  label="Priority"
                  onChange={(e) =>
                    setNewIssue({ ...newIssue, priority: e.target.value })
                  }
                >
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Assigned To"
                fullWidth
                value={newIssue.assigned_to}
                onChange={(e) =>
                  setNewIssue({ ...newIssue, assigned_to: e.target.value })
                }
              />

              <TextField
                label="Reported By"
                fullWidth
                value={newIssue.reported_by}
                onChange={(e) =>
                  setNewIssue({ ...newIssue, reported_by: e.target.value })
                }
                required
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Supplier Name"
                fullWidth
                value={newIssue.supplier_name}
                onChange={(e) =>
                  setNewIssue({ ...newIssue, supplier_name: e.target.value })
                }
              />

              <FormControl fullWidth>
                <InputLabel>Part Affected</InputLabel>
                <Select
                  value={newIssue.part_id}
                  label="Part Affected"
                  onChange={(e) =>
                    setNewIssue({ ...newIssue, part_id: e.target.value })
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {parts.map((part) => (
                    <MenuItem key={part.id} value={part.id}>
                      {part.seat_part_number} - {part.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TextField
              label="Due Date"
              type="date"
              value={newIssue.due_date}
              onChange={(e) =>
                setNewIssue({ ...newIssue, due_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />

            <Divider />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateIssue}
            variant="contained"
            disabled={!newIssue.title || !newIssue.reported_by}
          >
            Create Issue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Issue Detail Dialog */}
      <Dialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedIssue
            ? `${selectedIssue.issue_number}: ${selectedIssue.title}`
            : 'Issue Details'}
        </DialogTitle>
        <DialogContent>
          {selectedIssue && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedIssue.description}
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Chip
                  label={selectedIssue.status}
                  color={getStatusColor(selectedIssue.status)}
                />
                <Chip
                  label={selectedIssue.severity}
                  color={getSeverityColor(selectedIssue.severity)}
                />
                <Chip
                  label={selectedIssue.priority}
                  color={getPriorityColor(selectedIssue.priority)}
                />
              </Stack>

              {/* Comments section would go here */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Comments ({selectedIssue.comments?.length || 0})
              </Typography>

              {/* Related defects section */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Related Defects ({selectedIssue.related_defects?.length || 0})
              </Typography>

              {selectedIssue.related_defects?.length > 0 ? (
                <List>
                  {selectedIssue.related_defects.map((defect) => (
                    <ListItem
                      key={defect.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleUnlinkDefect(defect.id)}
                          title="Unlink Defect"
                        >
                          <Close />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={`${defect.zone_name || 'No Zone'} - ${defect.part_number || 'No Part'}`}
                        secondary={`Zone: ${defect.zone_name || 'No Zone'} | Type: ${defect.defect_type_name || 'N/A'} | IQS Score: ${defect.iqs_score || 'N/A'} | Relationship: ${defect.relationship_type}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: 'italic' }}
                >
                  No defects linked to this issue.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Link Defects Dialog */}
      <Dialog
        open={showLinkDefectDialog}
        onClose={() => setShowLinkDefectDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Link Defects to Issue: {selectedIssue?.issue_number}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {/* Defect Filters */}
            <Typography variant="subtitle2">Filter Defects</Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                label="Search"
                size="small"
                value={defectFilters.search}
                onChange={(e) =>
                  handleDefectFilterChange('search', e.target.value)
                }
                placeholder="Search by description or type"
              />

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Zone</InputLabel>
                <Select
                  value={defectFilters.zone}
                  label="Zone"
                  onChange={(e) =>
                    handleDefectFilterChange('zone', e.target.value)
                  }
                >
                  <MenuItem value="">All Zones</MenuItem>
                  {/* Zone options would be populated dynamically */}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Part</InputLabel>
                <Select
                  value={defectFilters.part}
                  label="Part"
                  onChange={(e) =>
                    handleDefectFilterChange('part', e.target.value)
                  }
                >
                  <MenuItem value="">All Parts</MenuItem>
                  {parts.map((part) => (
                    <MenuItem key={part.id} value={part.id}>
                      {part.seat_part_number}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                size="small"
                onClick={clearDefectFilters}
              >
                Clear
              </Button>
            </Stack>

            <Divider />

            {/* Defect Selection List */}
            <Typography variant="subtitle2">
              Select Defects to Link ({selectedDefects.length} selected)
            </Typography>

            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {defects.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 4 }}
                >
                  No defects found matching the current filters.
                </Typography>
              ) : (
                <List>
                  {defects.map((defect) => {
                    const isSelected = selectedDefects.includes(defect.id);
                    const isAlreadyLinked =
                      selectedIssue?.related_defects?.some(
                        (linked) => linked.id === defect.id
                      );

                    return (
                      <ListItem
                        key={defect.id}
                        dense
                        disabled={isAlreadyLinked}
                      >
                        <ListItemIcon>
                          <Checkbox
                            checked={isSelected}
                            disabled={isAlreadyLinked}
                            onChange={(e) =>
                              handleDefectSelection(defect.id, e.target.checked)
                            }
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${defect.zone_name || 'No Zone'} - ${defect.part_number || 'No Part'}`}
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                Type: {defect.defect_type_name} | IQS Score:{' '}
                                {defect.iqs_score || 'N/A'}
                              </Typography>
                              {isAlreadyLinked && (
                                <Typography
                                  variant="caption"
                                  component="div"
                                  color="text.secondary"
                                  sx={{ fontStyle: 'italic' }}
                                >
                                  Already linked to this issue
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLinkDefectDialog(false)}>Cancel</Button>
          <Button
            onClick={handleLinkDefects}
            variant="contained"
            disabled={selectedDefects.length === 0}
          >
            Link Selected Defects ({selectedDefects.length})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Issue Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Issue: {selectedIssue?.issue_number}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              value={editIssue.title}
              onChange={(e) =>
                setEditIssue({ ...editIssue, title: e.target.value })
              }
              required
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={editIssue.description}
              onChange={(e) =>
                setEditIssue({ ...editIssue, description: e.target.value })
              }
            />

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Issue Type</InputLabel>
                <Select
                  value={editIssue.issue_type}
                  label="Issue Type"
                  onChange={(e) =>
                    setEditIssue({ ...editIssue, issue_type: e.target.value })
                  }
                >
                  <MenuItem value="supplier">Supplier</MenuItem>
                  <MenuItem value="manufacturing">Manufacturing</MenuItem>
                  <MenuItem value="design">Design</MenuItem>
                  <MenuItem value="quality">Quality</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editIssue.status}
                  label="Status"
                  onChange={(e) =>
                    setEditIssue({ ...editIssue, status: e.target.value })
                  }
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={editIssue.severity}
                  label="Severity"
                  onChange={(e) =>
                    setEditIssue({ ...editIssue, severity: e.target.value })
                  }
                >
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="major">Major</MenuItem>
                  <MenuItem value="minor">Minor</MenuItem>
                  <MenuItem value="cosmetic">Cosmetic</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={editIssue.priority}
                  label="Priority"
                  onChange={(e) =>
                    setEditIssue({ ...editIssue, priority: e.target.value })
                  }
                >
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Assigned To"
                fullWidth
                value={editIssue.assigned_to}
                onChange={(e) =>
                  setEditIssue({ ...editIssue, assigned_to: e.target.value })
                }
              />

              <TextField
                label="Reported By"
                fullWidth
                value={editIssue.reported_by}
                onChange={(e) =>
                  setEditIssue({ ...editIssue, reported_by: e.target.value })
                }
                required
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Supplier Name"
                fullWidth
                value={editIssue.supplier_name}
                onChange={(e) =>
                  setEditIssue({ ...editIssue, supplier_name: e.target.value })
                }
              />

              <FormControl fullWidth>
                <InputLabel>Part Affected</InputLabel>
                <Select
                  value={editIssue.part_id}
                  label="Part Affected"
                  onChange={(e) =>
                    setEditIssue({ ...editIssue, part_id: e.target.value })
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {parts.map((part) => (
                    <MenuItem key={part.id} value={part.id}>
                      {part.seat_part_number} - {part.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TextField
              label="Due Date"
              type="date"
              value={editIssue.due_date}
              onChange={(e) =>
                setEditIssue({ ...editIssue, due_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Root Cause"
              fullWidth
              multiline
              rows={3}
              value={editIssue.root_cause}
              onChange={(e) =>
                setEditIssue({ ...editIssue, root_cause: e.target.value })
              }
            />

            <TextField
              label="Corrective Action"
              fullWidth
              multiline
              rows={3}
              value={editIssue.corrective_action}
              onChange={(e) =>
                setEditIssue({
                  ...editIssue,
                  corrective_action: e.target.value,
                })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleEditIssue}
            variant="contained"
            disabled={!editIssue.title || !editIssue.reported_by}
          >
            Update Issue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Column Configuration Dialog */}
      <Dialog
        open={showColumnDialog}
        onClose={() => setShowColumnDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings />
            Configure Table Columns
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Show or hide columns and reorder them by dragging. Changes are
            applied immediately.
          </Typography>

          <List>
            {columnConfig.map((column, index) => (
              <ListItem
                key={column.key}
                dense
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  handleDragStart(index);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOver(index);
                }}
                onDragEnd={handleDragEnd}
                sx={{
                  border: '1px solid',
                  borderColor:
                    dragState.dragOverIndex === index
                      ? 'primary.main'
                      : 'divider',
                  borderRadius: 1,
                  mb: 1,
                  bgcolor:
                    dragState.draggedIndex === index
                      ? 'action.selected'
                      : dragState.dragOverIndex === index
                        ? 'primary.light'
                        : 'background.paper',
                  opacity: dragState.draggedIndex === index ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                  cursor: 'move',
                  '&:hover': {
                    bgcolor:
                      dragState.draggedIndex === null
                        ? 'action.hover'
                        : undefined,
                  },
                }}
              >
                <ListItemIcon>
                  <DragIndicator sx={{ color: 'action.active' }} />
                </ListItemIcon>
                <ListItemText
                  primary={column.label}
                  secondary={`Key: ${column.key} | Width: ${column.width}px`}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={column.visible}
                      onChange={(e) =>
                        handleColumnVisibilityChange(
                          column.key,
                          e.target.checked
                        )
                      }
                      disabled={column.key === 'actions'} // Always keep actions visible
                    />
                  }
                  label="Visible"
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight="medium" gutterBottom>
              Current visible columns: {visibleColumns.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {visibleColumns.map((col) => col.label).join(', ')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowColumnDialog(false)}>Close</Button>
          <Button
            variant="outlined"
            onClick={() => {
              // Reset to default configuration
              setColumnConfig([
                {
                  key: 'issue_number',
                  label: 'Issue #',
                  visible: true,
                  width: 100,
                },
                { key: 'title', label: 'Title', visible: true, width: 200 },
                { key: 'issue_type', label: 'Type', visible: true, width: 120 },
                { key: 'status', label: 'Status', visible: true, width: 120 },
                {
                  key: 'severity',
                  label: 'Severity',
                  visible: true,
                  width: 120,
                },
                {
                  key: 'priority',
                  label: 'Priority',
                  visible: true,
                  width: 120,
                },
                {
                  key: 'assigned_to',
                  label: 'Assigned To',
                  visible: true,
                  width: 150,
                },
                {
                  key: 'created_at',
                  label: 'Created',
                  visible: true,
                  width: 120,
                },
                {
                  key: 'due_date',
                  label: 'Due Date',
                  visible: false,
                  width: 120,
                },
                {
                  key: 'supplier_name',
                  label: 'Supplier',
                  visible: false,
                  width: 150,
                },
                {
                  key: 'reported_by',
                  label: 'Reported By',
                  visible: false,
                  width: 150,
                },
                { key: 'actions', label: 'Actions', visible: true, width: 160 },
              ]);
            }}
          >
            Reset to Default
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
