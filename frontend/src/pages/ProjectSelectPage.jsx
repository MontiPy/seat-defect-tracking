import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Grid,
  Divider,
  Badge,
} from '@mui/material';
import {
  Add,
  Analytics,
  Edit,
  BarChart,
  BugReport,
  Search,
  FilterList,
  Clear,
  Schedule,
  TrendingUp,
  Assessment,
  Launch,
} from '@mui/icons-material';
import api from '../services/api';
import { theme } from '../utils/theme';
import { ProjectCardSkeleton } from '../components/SkeletonLoader';

function ProjectSelectPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [projectStats, setProjectStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await api.get('/projects');
        const projectData = res.data.data || [];
        setProjects(projectData);

        // Fetch statistics for each project
        const statsPromises = projectData.map(async (project) => {
          try {
            const issuesRes = await api
              .get(`/issues?project_id=${project.id}`)
              .catch(() => ({ data: { data: [] } }));

            // Filter for open issues only
            const issues = issuesRes.data.data || [];
            const openIssues = issues.filter(
              (issue) => issue.status === 'open'
            );

            return {
              id: project.id,
              openIssueCount: openIssues.length,
              lastActivity: project.updated_at || project.created_at,
            };
          } catch (err) {
            console.error(
              `Error fetching stats for project ${project.id}:`,
              err
            );
            return {
              id: project.id,
              openIssueCount: 0,
              lastActivity: project.updated_at || project.created_at,
            };
          }
        });

        const stats = await Promise.all(statsPromises);
        const statsMap = stats.reduce((acc, stat) => {
          acc[stat.id] = stat;
          return acc;
        }, {});

        setProjectStats(statsMap);
        setError(null);
      } catch (err) {
        setError('Failed to load projects. Please try again.');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleProjectSelect = (id) => setSelectedProjectId(id);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Filter and sort projects
  const filteredAndSortedProjects = projects
    .filter((project) => {
      if (!searchTerm) return true;
      return (
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      const aStats = projectStats[a.id] || {};
      const bStats = projectStats[b.id] || {};

      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'activity':
          return (
            new Date(bStats.lastActivity || 0) -
            new Date(aStats.lastActivity || 0)
          );
        case 'defects':
          return (bStats.defectCount || 0) - (aStats.defectCount || 0);
        case 'issues':
          return (bStats.openIssueCount || 0) - (aStats.openIssueCount || 0);
        default:
          return 0;
      }
    });

  const handleQuickAction = (projectId, action) => {
    navigate(`/projects/${projectId}/${action}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('name');
  };

  const navigationButtons = [
    {
      label: 'Log Defects',
      icon: <Add />,
      path: 'entry-defect',
      color: 'primary',
      variant: 'contained',
    },
    {
      label: 'Review Defects',
      icon: <Analytics />,
      path: 'defects-review',
      color: 'primary',
      variant: 'outlined',
    },
    {
      label: 'Issue Tracking',
      icon: <BugReport />,
      path: 'issue-tracking',
      color: 'error',
      variant: 'outlined',
    },
    {
      label: 'Edit Zones',
      icon: <Edit />,
      path: 'zone-editor',
      color: 'secondary',
      variant: 'outlined',
    },
    {
      label: 'Analytics',
      icon: <BarChart />,
      path: 'pareto',
      color: 'secondary',
      variant: 'outlined',
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 600,
          fontSize: { xs: '1.75rem', sm: '2.125rem' },
        }}
      >
        Select a Project
      </Typography>

      {/* Search and Filter Controls */}
      <Card sx={{ mb: 3, p: { xs: 2, sm: 2 } }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm('')} size="small">
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="activity">Recent Activity</MenuItem>
                <MenuItem value="defects">Defect Count</MenuItem>
                <MenuItem value="issues">Issue Count</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={8} sm={12} md={3}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              {filteredAndSortedProjects.length} of {projects.length} projects
            </Typography>
          </Grid>
          <Grid item xs={4} sm={12} md={2}>
            {(searchTerm || sortBy !== 'name') && (
              <Button
                startIcon={<Clear />}
                onClick={clearFilters}
                variant="outlined"
                size="small"
                fullWidth
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Clear
              </Button>
            )}
          </Grid>
        </Grid>
      </Card>

      {loading && (
        <Box sx={{ mt: 3 }}>
          <ProjectCardSkeleton count={6} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          {filteredAndSortedProjects.length === 0 ? (
            <Alert severity="info" sx={{ textAlign: 'center' }}>
              {projects.length === 0
                ? 'No projects found. Create a project in the Manage Projects section.'
                : 'No projects match your search criteria.'}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredAndSortedProjects.map((project) => {
                const stats = projectStats[project.id] || {};
                const isSelected = selectedProjectId === project.id;
                const hasIssues = stats.openIssueCount > 0;
                const hasHighActivity = stats.defectCount > 10;

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
                    <Card
                      sx={{
                        height: { xs: 'auto', sm: 320 },
                        minHeight: { xs: 280, sm: 320 },
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                        border: isSelected ? '2px solid' : '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        backgroundColor: isSelected
                          ? 'primary.50'
                          : 'background.paper',
                        '&:hover': {
                          transform: { xs: 'none', sm: 'translateY(-4px)' },
                          boxShadow:
                            theme?.shadows?.[6] ||
                            'rgba(0,0,0,0.08) 0px 4px 8px',
                        },
                        '&:active': {
                          transform: {
                            xs: 'scale(0.98)',
                            sm: 'translateY(-2px)',
                          },
                        },
                      }}
                      onClick={() => handleProjectSelect(project.id)}
                    >
                      {/* Header with status indicators */}
                      <Box sx={{ p: { xs: 2, sm: 2 }, pb: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                              fontWeight: isSelected ? 600 : 500,
                              color: isSelected
                                ? 'primary.main'
                                : 'text.primary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1,
                              mr: 1,
                              fontSize: { xs: '1.1rem', sm: '1.25rem' },
                            }}
                          >
                            {project.name}
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            {hasIssues && (
                              <Chip
                                label="Issues"
                                size="small"
                                color="warning"
                                variant="outlined"
                              />
                            )}
                            {hasHighActivity && (
                              <Chip
                                label="Active"
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: 40,
                          }}
                        >
                          {project.description || 'No description available'}
                        </Typography>
                      </Box>

                      {/* Statistics Section */}
                      <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50', flex: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Project Statistics
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Badge
                                badgeContent={stats.openIssueCount || 0}
                                color="error"
                                max={99}
                              >
                                <BugReport color="action" />
                              </Badge>
                              <Typography variant="caption" display="block">
                                Open Issues
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {stats.lastActivity && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mt: 1,
                              gap: 0.5,
                            }}
                          >
                            <Schedule fontSize="small" color="action" />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Updated{' '}
                              {new Date(
                                stats.lastActivity
                              ).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Quick Actions */}
                      <CardActions sx={{ p: { xs: 2, sm: 1 }, pt: 0 }}>
                        {isSelected ? (
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1}
                            sx={{ width: '100%', justifyContent: 'center' }}
                          >
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<Add />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAction(project.id, 'entry-defect');
                              }}
                              sx={{
                                minHeight: 44,
                                width: { xs: '100%', sm: 'auto' },
                              }}
                            >
                              Log Defect
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Analytics />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAction(project.id, 'defects-review');
                              }}
                              sx={{
                                minHeight: 44,
                                width: { xs: '100%', sm: 'auto' },
                              }}
                            >
                              Review
                            </Button>
                          </Stack>
                        ) : (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              width: '100%',
                              textAlign: 'center',
                              minHeight: 44,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            Tap to select project
                          </Typography>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}

      {/* Selected Project Actions - Now shown as a bottom drawer */}
      {selectedProject && (
        <Card
          sx={{
            mt: 4,
            p: { xs: 2, sm: 3 },
            bgcolor: 'primary.50',
            border: '2px solid',
            borderColor: 'primary.main',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 1,
              color: 'primary.main',
              fontWeight: 600,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            {selectedProject.name}
          </Typography>
          {selectedProject.description && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, fontSize: { xs: '0.9rem', sm: '1rem' } }}
            >
              {selectedProject.description}
            </Typography>
          )}

          <Divider sx={{ mb: 3 }} />

          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            Quick Actions
          </Typography>

          <Grid container spacing={2}>
            {navigationButtons.map((button) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={button.path}>
                <Button
                  variant={button.variant}
                  color={button.color}
                  startIcon={button.icon}
                  endIcon={<Launch fontSize="small" />}
                  fullWidth
                  onClick={() => {
                    if (button.external) {
                      navigate(button.path);
                    } else {
                      navigate(
                        `/projects/${selectedProjectId}/${button.path}`,
                        {
                          state: { project: selectedProjectId },
                        }
                      );
                    }
                  }}
                  sx={{
                    py: { xs: 2, sm: 1.5 },
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    minHeight: 48,
                    fontSize: { xs: '0.9rem', sm: '0.875rem' },
                  }}
                >
                  {button.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Card>
      )}
    </Box>
  );
}

export default ProjectSelectPage;
