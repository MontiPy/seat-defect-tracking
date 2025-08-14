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
} from '@mui/material';
import { Add, Analytics, Edit, BarChart, BugReport } from '@mui/icons-material';
import api from '../services/api';
import { theme } from '../utils/theme';

function ProjectSelectPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await api.get('/projects');
        setProjects(res.data.data || []);
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
    <Box sx={theme.layout.centerContainer}>
      <Box
        sx={{
          width: '100%',
          maxWidth: theme.layout.contentMaxWidth,
          textAlign: 'center',
        }}
      >
        <Typography {...theme.typography.pageTitle}>
          Select a Project
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
            {projects.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                No projects found. Create a project in the Manage Projects
                section.
              </Alert>
            ) : (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    justifyContent: 'center',
                    mb: 4,
                  }}
                >
                  {projects.map((project) => (
                    <Card
                      key={project.id}
                      sx={{
                        width: 280,
                        height: 140,
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        border: selectedProjectId === project.id ? 2 : 1,
                        borderColor:
                          selectedProjectId === project.id
                            ? 'primary.main'
                            : 'divider',
                        backgroundColor:
                          selectedProjectId === project.id
                            ? 'primary.50'
                            : 'background.paper',
                        '&:hover': {
                          elevation: 4,
                          transform: 'translateY(-2px)',
                        },
                      }}
                      onClick={() => handleProjectSelect(project.id)}
                    >
                      <CardContent
                        sx={{
                          pb: 1,
                          flexGrow: 1,
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontWeight:
                              selectedProjectId === project.id ? 600 : 500,
                            color:
                              selectedProjectId === project.id
                                ? 'primary.main'
                                : 'text.primary',
                            mb: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {project.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            flexGrow: 1,
                          }}
                        >
                          {project.description || 'No description available'}
                        </Typography>
                      </CardContent>
                      {selectedProjectId === project.id && (
                        <CardActions
                          sx={{
                            pt: 0,
                            justifyContent: 'center',
                            mt: 'auto',
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="primary.main"
                            sx={{ fontWeight: 500 }}
                          >
                            Selected
                          </Typography>
                        </CardActions>
                      )}
                    </Card>
                  ))}
                </Box>

                {selectedProject && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {selectedProject.name}
                    </Typography>
                    {selectedProject.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        {selectedProject.description}
                      </Typography>
                    )}

                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2}
                      justifyContent="center"
                      sx={{ maxWidth: 600, mx: 'auto' }}
                    >
                      {navigationButtons.map((button) => (
                        <Button
                          key={button.path}
                          variant={button.variant}
                          color={button.color}
                          startIcon={button.icon}
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
                            minWidth: { xs: '100%', sm: 140 },
                            py: 1.5,
                          }}
                        >
                          {button.label}
                        </Button>
                      ))}
                    </Stack>
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default ProjectSelectPage;
