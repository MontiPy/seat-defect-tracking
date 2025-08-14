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
  Grid,
  Skeleton,
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
  Check,
} from '@mui/icons-material';
import api from '../services/api';
import { theme } from '../utils/theme';
import {
  TableSkeleton,
  StatsCardsSkeleton,
} from '../components/SkeletonLoader';
import IssueAttachments from '../components/IssueAttachments';

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
  const [buildEvents, setBuildEvents] = useState([]);
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
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [bulkAction, setBulkAction] = useState({
    type: '',
    status: '',
    assignedTo: '',
    priority: '',
  });

  // Table view presets
  const [currentView, setCurrentView] = useState('summary');
  const tableViewPresets = {
    summary: {
      name: 'Summary View',
      description: 'Essential columns for quick overview',
      icon: ViewColumn,
      columns: [
        'issue_number',
        'title',
        'status',
        'severity',
        'priority',
        'assigned_to',
        'actions',
      ],
    },
    detailed: {
      name: 'Detailed View',
      description: 'All important columns for comprehensive review',
      icon: Visibility,
      columns: [
        'issue_number',
        'title',
        'issue_type',
        'status',
        'severity',
        'priority',
        'assigned_to',
        'reported_by',
        'created_at',
        'actions',
      ],
    },
    management: {
      name: 'Management View',
      description: 'Focus on tracking and assignments',
      icon: Settings,
      columns: [
        'issue_number',
        'title',
        'status',
        'priority',
        'assigned_to',
        'due_date',
        'supplier_name',
        'actions',
      ],
    },
  };

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
    root_cause: '',
    corrective_action: '',
    application_timing: '',
    cm_confirmation: '',
    limit_book: '',
    nars_ims_number: '',
    root_cause_attachments: [],
    countermeasure_attachments: [],
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
    application_timing: '',
    cm_confirmation: '',
    limit_book: '',
    nars_ims_number: '',
    root_cause_attachments: [],
    countermeasure_attachments: [],
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

  const fetchBuildEvents = useCallback(async () => {
    try {
      const res = await api.get('/build-events');
      setBuildEvents(res.data.data || []);
    } catch (err) {
      console.error('Error fetching build events:', err);
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
      fetchBuildEvents();
    }
  }, [
    projectId,
    filters,
    fetchIssues,
    fetchStats,
    fetchParts,
    fetchBuildEvents,
  ]);

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
        root_cause: '',
        corrective_action: '',
        application_timing: '',
        cm_confirmation: '',
        limit_book: '',
        nars_ims_number: '',
        root_cause_attachments: [],
        countermeasure_attachments: [],
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
      application_timing: issue.application_timing || '',
      cm_confirmation: issue.cm_confirmation || '',
      limit_book: issue.limit_book || '',
      nars_ims_number: issue.nars_ims_number || '',
      root_cause_attachments: issue.root_cause_attachments || [],
      countermeasure_attachments: issue.countermeasure_attachments || [],
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

  // Bulk operations
  const handleSelectAllIssues = (checked) => {
    if (checked) {
      setSelectedIssues(issues.map((issue) => issue.id));
    } else {
      setSelectedIssues([]);
    }
  };

  const handleSelectIssue = (issueId, checked) => {
    if (checked) {
      setSelectedIssues((prev) => [...prev, issueId]);
    } else {
      setSelectedIssues((prev) => prev.filter((id) => id !== issueId));
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedIssues.length === 0) return;

    try {
      const updateData = {};
      if (bulkAction.status) updateData.status = bulkAction.status;
      if (bulkAction.assignedTo) updateData.assigned_to = bulkAction.assignedTo;
      if (bulkAction.priority) updateData.priority = bulkAction.priority;

      if (Object.keys(updateData).length === 0) return;

      await Promise.all(
        selectedIssues.map((issueId) =>
          api.put(`/issues/${issueId}`, updateData)
        )
      );

      setShowBulkDialog(false);
      setSelectedIssues([]);
      setBulkAction({ type: '', status: '', assignedTo: '', priority: '' });
      fetchIssues();
      fetchStats();
    } catch (err) {
      console.error('Error performing bulk update:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIssues.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIssues.length} issue(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await Promise.all(
        selectedIssues.map((issueId) => api.delete(`/issues/${issueId}`))
      );

      setSelectedIssues([]);
      fetchIssues();
      fetchStats();
    } catch (err) {
      console.error('Error performing bulk delete:', err);
    }
  };

  // Column management functions
  const handleColumnVisibilityChange = (columnKey, visible) => {
    setColumnConfig((prev) =>
      prev.map((col) => (col.key === columnKey ? { ...col, visible } : col))
    );
    setCurrentView('custom'); // Switch to custom view when manually changing columns
  };

  const handleColumnReorder = (fromIndex, toIndex) => {
    setColumnConfig((prev) => {
      const newConfig = [...prev];
      const [removed] = newConfig.splice(fromIndex, 1);
      newConfig.splice(toIndex, 0, removed);
      return newConfig;
    });
    setCurrentView('custom'); // Switch to custom view when manually reordering columns
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

  // Apply current view preset to column configuration
  const applyViewPreset = (viewKey) => {
    const preset = tableViewPresets[viewKey];
    if (!preset) return;

    const updatedConfig = columnConfig.map((col) => ({
      ...col,
      visible: preset.columns.includes(col.key),
    }));

    setColumnConfig(updatedConfig);
    setCurrentView(viewKey);
  };

  // Initialize with summary view
  React.useEffect(() => {
    if (currentView === 'summary') {
      applyViewPreset('summary');
    }
  }, []); // Only run once on mount

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
      <Typography
        {...theme.typography.pageTitle}
        sx={{
          fontSize: { xs: '1.75rem', sm: '2.125rem' },
          mb: { xs: 2, sm: 3 },
        }}
      >
        Issue Tracking
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {loading ? (
        <StatsCardsSkeleton count={4} />
      ) : (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            mb: 3,
            paddingY: '5px',
            overflowX: { xs: 'visible', sm: 'auto' },
            '& .MuiCard-root': {
              minWidth: { xs: 'auto', sm: 150 },
              flex: { xs: '1', sm: 'none' },
            },
          }}
        >
          <Card>
            <CardContent
              sx={{
                textAlign: 'center',
                pb: '16px !important',
                p: { xs: 2, sm: 3 },
              }}
            >
              <Typography
                variant="h4"
                color="primary"
                sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
              >
                {stats.total || 0}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                Total Issues
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent
              sx={{
                textAlign: 'center',
                pb: '16px !important',
                p: { xs: 2, sm: 3 },
              }}
            >
              <Typography
                variant="h4"
                color="error"
                sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
              >
                {stats.open || 0}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                Open
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent
              sx={{
                textAlign: 'center',
                pb: '16px !important',
                p: { xs: 2, sm: 3 },
              }}
            >
              <Typography
                variant="h4"
                color="success.main"
                sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
              >
                {stats.resolved || 0}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                Resolved
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* Action Bar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={{ xs: 2, sm: 0 }}
        sx={{ mb: 3 }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 2 }}
        >
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowCreateDialog(true)}
            fullWidth={{ xs: true, sm: false }}
            sx={{ minHeight: 44 }}
          >
            New Issue
          </Button>
          <Stack
            direction="row"
            spacing={1}
            sx={{ display: { xs: 'flex', sm: 'flex' } }}
          >
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                fetchIssues();
                fetchStats();
              }}
              fullWidth={{ xs: true, sm: false }}
              sx={{ minHeight: 44, flex: { xs: 1, sm: 'none' } }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<ViewColumn />}
              onClick={() => setShowColumnDialog(true)}
              fullWidth={{ xs: true, sm: false }}
              sx={{
                minHeight: 44,
                flex: { xs: 1, sm: 'none' },
                display: { xs: 'none', md: 'flex' },
              }}
            >
              Columns
            </Button>
          </Stack>
        </Stack>

        {/* View Presets - Desktop only */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            View:
          </Typography>
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto' }}>
            {Object.entries(tableViewPresets).map(([key, preset]) => {
              const IconComponent = preset.icon;
              const isActive = currentView === key;
              return (
                <Button
                  key={key}
                  variant={isActive ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<IconComponent fontSize="small" />}
                  onClick={() => applyViewPreset(key)}
                  sx={{
                    textTransform: 'none',
                    minWidth: 'auto',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {preset.name}
                </Button>
              );
            })}
            <Button
              variant={currentView === 'custom' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<Settings fontSize="small" />}
              onClick={() => {
                setCurrentView('custom');
                setShowColumnDialog(true);
              }}
              sx={{
                textTransform: 'none',
                minWidth: 'auto',
              }}
            >
              Custom
            </Button>
          </Stack>
        </Box>

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

      {/* Bulk Actions Toolbar */}
      {selectedIssues.length > 0 && (
        <Card
          sx={{
            mb: 2,
            bgcolor: 'primary.50',
            borderColor: 'primary.main',
            border: 1,
          }}
        >
          <CardContent sx={{ py: 2 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="subtitle1" color="primary">
                  {selectedIssues.length} issue
                  {selectedIssues.length > 1 ? 's' : ''} selected
                </Typography>
                <Button
                  size="small"
                  onClick={() => setSelectedIssues([])}
                  startIcon={<Close />}
                >
                  Clear Selection
                </Button>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    setBulkAction({
                      type: 'update',
                      status: '',
                      assignedTo: '',
                      priority: '',
                    });
                    setShowBulkDialog(true);
                  }}
                  startIcon={<Edit />}
                >
                  Bulk Update
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={handleBulkDelete}
                  startIcon={<Delete />}
                >
                  Delete Selected
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Issues Table - Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        {loading ? (
          <TableSkeleton rows={8} columns={visibleColumns.length + 1} />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {/* Select All Checkbox */}
                  <TableCell sx={{ width: 50 }}>
                    <Checkbox
                      checked={
                        selectedIssues.length === issues.length &&
                        issues.length > 0
                      }
                      indeterminate={
                        selectedIssues.length > 0 &&
                        selectedIssues.length < issues.length
                      }
                      onChange={(e) => handleSelectAllIssues(e.target.checked)}
                    />
                  </TableCell>
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
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
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
                    {/* Row Select Checkbox */}
                    <TableCell>
                      <Checkbox
                        checked={selectedIssues.includes(issue.id)}
                        onChange={(e) =>
                          handleSelectIssue(issue.id, e.target.checked)
                        }
                      />
                    </TableCell>
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
        )}
      </Box>

      {/* Issues Cards - Mobile */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {loading ? (
          <Box sx={{ px: 1 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} sx={{ mb: 2, p: 2 }}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Skeleton variant="rectangular" width={20} height={20} />
                    <Skeleton variant="text" width="60%" height={24} />
                  </Box>
                  <Skeleton variant="text" width="80%" height={16} />
                  <Skeleton variant="text" width="40%" height={16} />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Skeleton variant="rectangular" width={60} height={24} />
                    <Skeleton variant="rectangular" width={80} height={24} />
                  </Box>
                </Stack>
              </Card>
            ))}
          </Box>
        ) : (
          <Stack spacing={2} sx={{ px: 1 }}>
            {issues.map((issue) => (
              <Card
                key={issue.id}
                sx={{
                  p: 2,
                  border: selectedIssues.includes(issue.id)
                    ? '2px solid'
                    : '1px solid',
                  borderColor: selectedIssues.includes(issue.id)
                    ? 'primary.main'
                    : 'divider',
                }}
              >
                <Stack spacing={2}>
                  {/* Header with checkbox and issue number */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Checkbox
                      checked={selectedIssues.includes(issue.id)}
                      onChange={(e) =>
                        handleSelectIssue(issue.id, e.target.checked)
                      }
                      sx={{ p: 0, minHeight: 44, minWidth: 44 }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: 'primary.main' }}
                    >
                      #{issue.issue_number || issue.id}
                    </Typography>
                    <Box sx={{ ml: 'auto' }}>
                      {renderTableCell(issue, { key: 'status' })}
                    </Box>
                  </Box>

                  {/* Title */}
                  <Typography
                    variant="h6"
                    sx={{ fontSize: '1rem', fontWeight: 500, lineHeight: 1.3 }}
                  >
                    {issue.title}
                  </Typography>

                  {/* Key details */}
                  <Grid
                    container
                    spacing={1}
                    sx={{ '& .MuiGrid-item': { py: 0.5 } }}
                  >
                    <Grid item xs={6}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Type
                      </Typography>
                      <Typography variant="body2">
                        {renderTableCell(issue, { key: 'issue_type' })}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Priority
                      </Typography>
                      <Typography variant="body2">
                        {renderTableCell(issue, { key: 'priority' })}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Severity
                      </Typography>
                      <Typography variant="body2">
                        {renderTableCell(issue, { key: 'severity' })}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Assigned
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {issue.assigned_to || 'Unassigned'}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Actions */}
                  <Box
                    sx={{ display: 'flex', gap: 1, pt: 1, flexWrap: 'wrap' }}
                  >
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => fetchIssueDetails(issue.id)}
                      sx={{ minHeight: 44, flex: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => openEditDialog(issue)}
                      sx={{ minHeight: 44, flex: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Link />}
                      onClick={() => openLinkDefectDialog(issue)}
                      sx={{ minHeight: 44, flex: 1 }}
                    >
                      Link
                    </Button>
                  </Box>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {issues.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No issues found for this project.
        </Alert>
      )}

      {/* Create Issue Dialog - Single Form */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '60vw',
            maxWidth: 'none',
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h5">Create New Issue</Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 0, height: '85vh', overflow: 'hidden' }}>
          <Grid container sx={{ height: '100%', width: '100%', m: 0 }}>
            {/* LEFT SIDE */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                p: 2,
                pr: 1.5,
                borderRight: '1px solid',
                borderColor: 'divider',
                width: '50%',
                maxWidth: '50%',
                flexBasis: '50%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack spacing={2} sx={{ width: '100%', height: '100%' }}>
                {/* Basic Information */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Basic Information
                  </Typography>

                  <Stack spacing={1.5} sx={{ width: '100%' }}>
                    <TextField
                      label="Issue Title *"
                      fullWidth
                      value={newIssue.title}
                      onChange={(e) =>
                        setNewIssue((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter a concise, descriptive title"
                      required
                    />

                    <TextField
                      label="Description"
                      fullWidth
                      multiline
                      rows={2}
                      value={newIssue.description}
                      onChange={(e) =>
                        setNewIssue((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Provide detailed information about the issue"
                    />

                    <FormControl fullWidth>
                      <InputLabel>Part Affected</InputLabel>
                      <Select
                        value={newIssue.part_id}
                        label="Part Affected"
                        onChange={(e) =>
                          setNewIssue((prev) => ({
                            ...prev,
                            part_id: e.target.value,
                          }))
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
                </Box>

                {/* Issue Classification */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Issue Classification
                  </Typography>

                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <FormControl fullWidth required>
                        <InputLabel>Issue Type</InputLabel>
                        <Select
                          value={newIssue.issue_type}
                          label="Issue Type"
                          onChange={(e) =>
                            setNewIssue((prev) => ({
                              ...prev,
                              issue_type: e.target.value,
                            }))
                          }
                        >
                          <MenuItem value="supplier">Supplier Issue</MenuItem>
                          <MenuItem value="manufacturing">
                            Manufacturing Issue
                          </MenuItem>
                          <MenuItem value="design">Design Issue</MenuItem>
                          <MenuItem value="quality">Quality Issue</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Severity</InputLabel>
                        <Select
                          value={newIssue.severity}
                          label="Severity"
                          onChange={(e) =>
                            setNewIssue((prev) => ({
                              ...prev,
                              severity: e.target.value,
                            }))
                          }
                        >
                          <MenuItem value="critical">Critical</MenuItem>
                          <MenuItem value="major">Major</MenuItem>
                          <MenuItem value="minor">Minor</MenuItem>
                          <MenuItem value="cosmetic">Cosmetic</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={newIssue.priority}
                          label="Priority"
                          onChange={(e) =>
                            setNewIssue((prev) => ({
                              ...prev,
                              priority: e.target.value,
                            }))
                          }
                        >
                          <MenuItem value="urgent">Urgent</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="low">Low</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>

                {/* Assignment & Responsibility */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Assignment & Responsibility
                  </Typography>

                  <Stack spacing={1.5} sx={{ width: '100%' }}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Reported By *"
                          fullWidth
                          value={newIssue.reported_by}
                          onChange={(e) =>
                            setNewIssue((prev) => ({
                              ...prev,
                              reported_by: e.target.value,
                            }))
                          }
                          placeholder="Reporting person"
                          required
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Assigned To"
                          fullWidth
                          value={newIssue.assigned_to}
                          onChange={(e) =>
                            setNewIssue((prev) => ({
                              ...prev,
                              assigned_to: e.target.value,
                            }))
                          }
                          placeholder="Assigned person"
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      label="Supplier Name"
                      fullWidth
                      value={newIssue.supplier_name}
                      onChange={(e) =>
                        setNewIssue((prev) => ({
                          ...prev,
                          supplier_name: e.target.value,
                        }))
                      }
                      placeholder="If applicable, name of supplier involved"
                    />

                    <TextField
                      label="Due Date"
                      type="date"
                      fullWidth
                      value={newIssue.due_date}
                      onChange={(e) =>
                        setNewIssue((prev) => ({
                          ...prev,
                          due_date: e.target.value,
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                      helperText="Target resolution date"
                    />
                  </Stack>
                </Box>
              </Stack>
            </Grid>

            {/* RIGHT SIDE */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                p: 2,
                pl: 1.5,
                width: '50%',
                maxWidth: '50%',
                flexBasis: '50%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack spacing={2} sx={{ width: '100%', height: '100%' }}>
                {/* Root Cause Details */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Root Cause Details
                  </Typography>

                  <Stack spacing={1.5} sx={{ width: '100%' }}>
                    <TextField
                      label="Root Cause Analysis"
                      fullWidth
                      multiline
                      rows={2}
                      value={newIssue.root_cause}
                      onChange={(e) =>
                        setNewIssue((prev) => ({
                          ...prev,
                          root_cause: e.target.value,
                        }))
                      }
                      placeholder="Detailed root cause analysis"
                    />

                    <IssueAttachments
                      label="Root Cause Attachments"
                      attachments={newIssue.root_cause_attachments}
                      onAttachmentsChange={(files) =>
                        setNewIssue((prev) => ({
                          ...prev,
                          root_cause_attachments: files,
                        }))
                      }
                      maxFiles={3}
                    />
                  </Stack>
                </Box>

                {/* Countermeasure Details */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Countermeasure Details
                  </Typography>

                  <Stack spacing={1.5} sx={{ width: '100%' }}>
                    <TextField
                      label="Corrective Action Plan"
                      fullWidth
                      multiline
                      rows={2}
                      value={newIssue.corrective_action}
                      onChange={(e) =>
                        setNewIssue((prev) => ({
                          ...prev,
                          corrective_action: e.target.value,
                        }))
                      }
                      placeholder="Detailed corrective action and prevention measures"
                    />

                    <IssueAttachments
                      label="Countermeasure Attachments"
                      attachments={newIssue.countermeasure_attachments}
                      onAttachmentsChange={(files) =>
                        setNewIssue((prev) => ({
                          ...prev,
                          countermeasure_attachments: files,
                        }))
                      }
                      maxFiles={3}
                    />
                  </Stack>
                </Box>

                {/* Timing & Additional Info */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Timing & Tracking
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Application Timing</InputLabel>
                        <Select
                          value={newIssue.application_timing}
                          label="Application Timing"
                          onChange={(e) =>
                            setNewIssue((prev) => ({
                              ...prev,
                              application_timing: e.target.value,
                            }))
                          }
                        >
                          <MenuItem value="">Not Set</MenuItem>
                          {buildEvents.map((event) => (
                            <MenuItem key={event.id} value={event.id}>
                              {event.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>C/M Confirmation</InputLabel>
                        <Select
                          value={newIssue.cm_confirmation}
                          label="C/M Confirmation"
                          onChange={(e) =>
                            setNewIssue((prev) => ({
                              ...prev,
                              cm_confirmation: e.target.value,
                            }))
                          }
                        >
                          <MenuItem value="">Not Set</MenuItem>
                          {buildEvents.map((event) => (
                            <MenuItem key={event.id} value={event.id}>
                              {event.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Limit Book?</InputLabel>
                        <Select
                          value={newIssue.limit_book}
                          label="Limit Book?"
                          onChange={(e) =>
                            setNewIssue((prev) => ({
                              ...prev,
                              limit_book: e.target.value,
                            }))
                          }
                        >
                          <MenuItem value="">Not Set</MenuItem>
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                          <MenuItem value="adding">Adding</MenuItem>
                          <MenuItem value="na">N/A</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="NARS/IMS Number"
                        fullWidth
                        value={newIssue.nars_ims_number}
                        onChange={(e) =>
                          setNewIssue((prev) => ({
                            ...prev,
                            nars_ims_number: e.target.value,
                          }))
                        }
                        placeholder="Enter tracking number"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateIssue}
            disabled={!newIssue.title.trim() || !newIssue.reported_by.trim()}
            startIcon={<Add />}
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
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '60vw',
            maxWidth: 'none',
          },
        }}
      >
        <DialogTitle>Edit Issue: {selectedIssue?.issue_number}</DialogTitle>

        <DialogContent sx={{ p: 0, height: '85vh', overflow: 'hidden' }}>
          <Grid container sx={{ height: '100%', width: '100%', m: 0 }}>
            {/* LEFT SIDE */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                p: 2,
                pr: 1.5,
                borderRight: '1px solid',
                borderColor: 'divider',
                width: '50%',
                maxWidth: '50%',
                flexBasis: '50%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack spacing={2} sx={{ width: '100%', height: '100%' }}>
                {/* Basic Information */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Basic Information
                  </Typography>

                  <Stack spacing={1.5} sx={{ width: '100%' }}>
                    <TextField
                      label="Issue Title *"
                      fullWidth
                      value={editIssue.title}
                      onChange={(e) =>
                        setEditIssue({ ...editIssue, title: e.target.value })
                      }
                      placeholder="Enter a concise, descriptive title"
                      required
                    />

                    <TextField
                      label="Description"
                      fullWidth
                      multiline
                      rows={2}
                      value={editIssue.description}
                      onChange={(e) =>
                        setEditIssue({
                          ...editIssue,
                          description: e.target.value,
                        })
                      }
                      placeholder="Provide detailed information about the issue"
                    />

                    <FormControl fullWidth>
                      <InputLabel>Part Affected</InputLabel>
                      <Select
                        value={editIssue.part_id}
                        label="Part Affected"
                        onChange={(e) =>
                          setEditIssue({
                            ...editIssue,
                            part_id: e.target.value,
                          })
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
                </Box>

                {/* Issue Classification */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Issue Classification
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Issue Type</InputLabel>
                        <Select
                          value={editIssue.issue_type}
                          label="Issue Type"
                          onChange={(e) =>
                            setEditIssue({
                              ...editIssue,
                              issue_type: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="supplier">Supplier Issue</MenuItem>
                          <MenuItem value="manufacturing">
                            Manufacturing Issue
                          </MenuItem>
                          <MenuItem value="design">Design Issue</MenuItem>
                          <MenuItem value="quality">Quality Issue</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={editIssue.status}
                          label="Status"
                          onChange={(e) =>
                            setEditIssue({
                              ...editIssue,
                              status: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="open">Open</MenuItem>
                          <MenuItem value="resolved">Resolved</MenuItem>
                          <MenuItem value="closed">Closed</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Severity</InputLabel>
                        <Select
                          value={editIssue.severity}
                          label="Severity"
                          onChange={(e) =>
                            setEditIssue({
                              ...editIssue,
                              severity: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="critical">Critical</MenuItem>
                          <MenuItem value="major">Major</MenuItem>
                          <MenuItem value="minor">Minor</MenuItem>
                          <MenuItem value="cosmetic">Cosmetic</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={editIssue.priority}
                          label="Priority"
                          onChange={(e) =>
                            setEditIssue({
                              ...editIssue,
                              priority: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="urgent">Urgent</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="low">Low</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>

                {/* Assignment & Responsibility */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Assignment & Responsibility
                  </Typography>

                  <Stack spacing={1.5} sx={{ width: '100%' }}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Reported By *"
                          fullWidth
                          value={editIssue.reported_by}
                          onChange={(e) =>
                            setEditIssue({
                              ...editIssue,
                              reported_by: e.target.value,
                            })
                          }
                          placeholder="Reporting person"
                          required
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Assigned To"
                          fullWidth
                          value={editIssue.assigned_to}
                          onChange={(e) =>
                            setEditIssue({
                              ...editIssue,
                              assigned_to: e.target.value,
                            })
                          }
                          placeholder="Assigned person"
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      label="Supplier Name"
                      fullWidth
                      value={editIssue.supplier_name}
                      onChange={(e) =>
                        setEditIssue({
                          ...editIssue,
                          supplier_name: e.target.value,
                        })
                      }
                      placeholder="If applicable, name of supplier involved"
                    />

                    <TextField
                      label="Due Date"
                      type="date"
                      fullWidth
                      value={editIssue.due_date}
                      onChange={(e) =>
                        setEditIssue({ ...editIssue, due_date: e.target.value })
                      }
                      InputLabelProps={{ shrink: true }}
                      helperText="Target resolution date"
                    />
                  </Stack>
                </Box>
              </Stack>
            </Grid>

            {/* RIGHT SIDE */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                p: 2,
                pl: 1.5,
                width: '50%',
                maxWidth: '50%',
                flexBasis: '50%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack spacing={2} sx={{ width: '100%', height: '100%' }}>
                {/* Root Cause Details */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Root Cause Details
                  </Typography>

                  <Stack spacing={1.5} sx={{ width: '100%' }}>
                    <TextField
                      label="Root Cause Analysis"
                      fullWidth
                      multiline
                      rows={2}
                      value={editIssue.root_cause}
                      onChange={(e) =>
                        setEditIssue({
                          ...editIssue,
                          root_cause: e.target.value,
                        })
                      }
                      placeholder="Detailed root cause analysis"
                    />

                    <IssueAttachments
                      label="Root Cause Attachments"
                      attachments={editIssue.root_cause_attachments}
                      onAttachmentsChange={(files) =>
                        setEditIssue((prev) => ({
                          ...prev,
                          root_cause_attachments: files,
                        }))
                      }
                      maxFiles={3}
                    />
                  </Stack>
                </Box>

                {/* Countermeasure Details */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Countermeasure Details
                  </Typography>

                  <Stack spacing={1.5} sx={{ width: '100%' }}>
                    <TextField
                      label="Corrective Action Plan"
                      fullWidth
                      multiline
                      rows={2}
                      value={editIssue.corrective_action}
                      onChange={(e) =>
                        setEditIssue({
                          ...editIssue,
                          corrective_action: e.target.value,
                        })
                      }
                      placeholder="Detailed corrective action and prevention measures"
                    />

                    <IssueAttachments
                      label="Countermeasure Attachments"
                      attachments={editIssue.countermeasure_attachments}
                      onAttachmentsChange={(files) =>
                        setEditIssue((prev) => ({
                          ...prev,
                          countermeasure_attachments: files,
                        }))
                      }
                      maxFiles={3}
                    />
                  </Stack>
                </Box>

                {/* Timing & Additional Info */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Timing & Tracking
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Application Timing</InputLabel>
                        <Select
                          value={editIssue.application_timing}
                          label="Application Timing"
                          onChange={(e) =>
                            setEditIssue({
                              ...editIssue,
                              application_timing: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="">Not Set</MenuItem>
                          {buildEvents.map((event) => (
                            <MenuItem key={event.id} value={event.id}>
                              {event.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>C/M Confirmation</InputLabel>
                        <Select
                          value={editIssue.cm_confirmation}
                          label="C/M Confirmation"
                          onChange={(e) =>
                            setEditIssue({
                              ...editIssue,
                              cm_confirmation: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="">Not Set</MenuItem>
                          {buildEvents.map((event) => (
                            <MenuItem key={event.id} value={event.id}>
                              {event.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Limit Book?</InputLabel>
                        <Select
                          value={editIssue.limit_book}
                          label="Limit Book?"
                          onChange={(e) =>
                            setEditIssue({
                              ...editIssue,
                              limit_book: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="">Not Set</MenuItem>
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                          <MenuItem value="adding">Adding</MenuItem>
                          <MenuItem value="na">N/A</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="NARS/IMS Number"
                        fullWidth
                        value={editIssue.nars_ims_number}
                        onChange={(e) =>
                          setEditIssue({
                            ...editIssue,
                            nars_ims_number: e.target.value,
                          })
                        }
                        placeholder="Enter tracking number"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </Grid>
          </Grid>
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
            Choose a preset view or customize columns by showing/hiding and
            reordering them.
          </Typography>

          {/* Preset Selection */}
          <Box sx={{ mb: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Quick Presets
            </Typography>
            <Grid container spacing={1}>
              {Object.entries(tableViewPresets).map(([key, preset]) => {
                const IconComponent = preset.icon;
                const isActive = currentView === key;
                return (
                  <Grid item xs={12} sm={4} key={key}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: isActive ? 2 : 1,
                        borderColor: isActive ? 'primary.main' : 'divider',
                        bgcolor: isActive ? 'primary.50' : 'background.paper',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'translateY(-2px)',
                        },
                      }}
                      onClick={() => applyViewPreset(key)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <IconComponent
                          color={isActive ? 'primary' : 'action'}
                          sx={{ mb: 1 }}
                        />
                        <Typography
                          variant="subtitle2"
                          color={isActive ? 'primary' : 'textPrimary'}
                          gutterBottom
                        >
                          {preset.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.7rem' }}
                        >
                          {preset.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" gutterBottom>
            Custom Column Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Drag to reorder columns and toggle visibility. Changes switch to
            Custom view.
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

      {/* Bulk Update Dialog */}
      <Dialog
        open={showBulkDialog}
        onClose={() => setShowBulkDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Edit />
            Bulk Update Issues ({selectedIssues.length})
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Update multiple issues at once. Only selected fields will be
            updated.
          </Typography>

          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={bulkAction.status}
                label="Status"
                onChange={(e) =>
                  setBulkAction({ ...bulkAction, status: e.target.value })
                }
              >
                <MenuItem value="">No Change</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={bulkAction.priority}
                label="Priority"
                onChange={(e) =>
                  setBulkAction({ ...bulkAction, priority: e.target.value })
                }
              >
                <MenuItem value="">No Change</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Assigned To"
              fullWidth
              value={bulkAction.assignedTo}
              onChange={(e) =>
                setBulkAction({ ...bulkAction, assignedTo: e.target.value })
              }
              placeholder="Leave empty to keep current assignments"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBulkDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleBulkUpdate}
            disabled={
              !bulkAction.status &&
              !bulkAction.priority &&
              !bulkAction.assignedTo
            }
            startIcon={<Check />}
          >
            Update {selectedIssues.length} Issue
            {selectedIssues.length > 1 ? 's' : ''}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
