/**
 * NavBar - Global Navigation and Breadcrumb Component
 *
 * This component provides the main navigation interface for the application,
 * including context-aware breadcrumbs, project information, and quick access
 * to different application sections.
 *
 * Features:
 * - Dynamic breadcrumb navigation based on current route
 * - Project context display when in project-specific screens
 * - Responsive design with mobile/desktop layouts
 * - Quick access menu for administrative functions
 * - CSS custom property for consistent layout spacing
 *
 * Navigation Structure:
 * - Home → Project Selection
 * - Project Context → Shows current project name/ID
 * - Section Navigation → Entry, Review, Zones, Analytics, Issues
 * - Admin Access → Project Management, Defect Types
 *
 * Responsive Behavior:
 * - Desktop: Full breadcrumb navigation with all options
 * - Mobile: Condensed layout with hamburger menu
 * - Adaptive text sizing and spacing
 *
 * Route Integration:
 * - Automatically detects project context from URL params
 * - Updates breadcrumbs based on current location
 * - Provides programmatic navigation to all major sections
 *
 * @returns {JSX.Element} Navigation bar with breadcrumbs and controls
 */

import React, { useEffect, useState } from 'react';

// Material-UI Components
import {
  AppBar,
  Toolbar,
  Button,
  Stack,
  Typography,
  Breadcrumbs,
  Link,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';

// React Router
import {
  useNavigate,
  useLocation,
  useParams,
  Link as RouterLink,
} from 'react-router-dom';

// Material-UI Icons
import {
  Home,
  ArrowBack,
  MoreVert,
  Settings,
  Business,
  BugReport,
} from '@mui/icons-material';

// Services
import api from '../services/api';

/**
 * NavBar Component
 *
 * Manages navigation state, project context, and responsive layout.
 * Sets CSS custom properties for consistent application layout.
 */
export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [project, setProject] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const NAVBAR_HEIGHT = 64;

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--navbar-height',
      `${NAVBAR_HEIGHT}px`
    );
  }, []);

  // Fetch project details when projectId is available
  useEffect(() => {
    if (projectId) {
      api
        .get(`/projects/${projectId}`)
        .then((res) => setProject(res.data.data))
        .catch((err) => console.error('Error fetching project:', err));
    } else {
      setProject(null);
    }
  }, [projectId]);

  // Generate breadcrumbs based on current route
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    // Always start with Home
    breadcrumbs.push({
      label: 'Home',
      icon: <Home fontSize="small" />,
      path: '/',
      isHome: true,
    });

    if (pathSegments.includes('manage-projects')) {
      breadcrumbs.push({
        label: 'Manage Projects',
        path: '/manage-projects',
        icon: <Settings fontSize="small" />,
      });
    } else if (pathSegments.includes('manage-defect-types')) {
      breadcrumbs.push({
        label: 'Manage Defect Types',
        path: '/manage-defect-types',
        icon: <Settings fontSize="small" />,
      });
    } else if (project && pathSegments.includes('projects')) {
      // Project-specific breadcrumbs
      breadcrumbs.push({
        label: project.name,
        path: `/projects/${project.id}`,
        isProject: true,
      });

      // Add specific screen breadcrumb
      if (pathSegments.includes('entry-defect')) {
        breadcrumbs.push({
          label: 'Log Defects',
          path: `/projects/${project.id}/entry-defect`,
        });
      } else if (pathSegments.includes('defects-review')) {
        breadcrumbs.push({
          label: 'Review Defects',
          path: `/projects/${project.id}/defects-review`,
        });
      } else if (pathSegments.includes('issue-tracking')) {
        breadcrumbs.push({
          label: 'Issue Tracking',
          path: `/projects/${project.id}/issue-tracking`,
          icon: <BugReport fontSize="small" />,
        });
      } else if (pathSegments.includes('zone-editor')) {
        breadcrumbs.push({
          label: 'Edit Zones',
          path: `/projects/${project.id}/zone-editor`,
        });
      } else if (pathSegments.includes('pareto')) {
        breadcrumbs.push({
          label: 'Analytics',
          path: `/projects/${project.id}/pareto`,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const showBackButton = breadcrumbs.length > 1;

  const handleBack = () => {
    if (breadcrumbs.length > 1) {
      navigate(breadcrumbs[breadcrumbs.length - 2].path);
    } else {
      navigate('/');
    }
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar sx={{ minHeight: NAVBAR_HEIGHT, height: NAVBAR_HEIGHT, px: 2 }}>
        {/* Left side - Back button and Branding */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          {showBackButton && (
            <IconButton
              color="inherit"
              onClick={handleBack}
              sx={{ mr: 1 }}
              aria-label="Go back"
            >
              <ArrowBack />
            </IconButton>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                fontWeight: 600,
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Business fontSize="small" />
              {isMobile ? 'SDS' : 'Seat Defect System'}
            </Typography>

            {/* Project context indicator */}
            {project && (
              <Chip
                label={project.name}
                size="small"
                variant="outlined"
                sx={{
                  color: 'inherit',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '& .MuiChip-label': { color: 'inherit' },
                }}
              />
            )}
          </Box>
        </Box>

        {/* Center - Breadcrumbs (desktop only) */}
        {!isMobile && breadcrumbs.length > 1 && (
          <Box sx={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
            <Breadcrumbs
              separator="›"
              sx={{
                color: 'inherit',
                '& .MuiBreadcrumbs-separator': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            >
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                const linkProps = isLast
                  ? {}
                  : {
                      component: RouterLink,
                      to: crumb.path,
                      sx: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        textDecoration: 'none',
                        '&:hover': { color: 'white' },
                      },
                    };

                return (
                  <Link key={crumb.path || crumb.label} {...linkProps}>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      {crumb.icon}
                      <Typography
                        variant="body2"
                        sx={{
                          color: isLast ? 'white' : 'inherit',
                          fontWeight: isLast ? 500 : 400,
                        }}
                      >
                        {crumb.label}
                      </Typography>
                    </Box>
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Box>
        )}

        {/* Right side - Menu */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'flex-end',
          }}
        >
          {isMobile ? (
            <>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    navigate('/');
                    handleMenuClose();
                  }}
                >
                  <Home sx={{ mr: 1 }} fontSize="small" />
                  Projects
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate('/manage-projects');
                    handleMenuClose();
                  }}
                >
                  <Settings sx={{ mr: 1 }} fontSize="small" />
                  Manage Projects
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate('/manage-defect-types');
                    handleMenuClose();
                  }}
                >
                  <Settings sx={{ mr: 1 }} fontSize="small" />
                  Defect Types
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button
                color="inherit"
                onClick={() => navigate('/')}
                startIcon={<Home fontSize="small" />}
                sx={{ textTransform: 'none' }}
              >
                Projects
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/manage-projects')}
                startIcon={<Settings fontSize="small" />}
                sx={{ textTransform: 'none' }}
              >
                Manage Projects
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/manage-defect-types')}
                startIcon={<Settings fontSize="small" />}
                sx={{ textTransform: 'none' }}
              >
                Defect Types
              </Button>
            </Stack>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
