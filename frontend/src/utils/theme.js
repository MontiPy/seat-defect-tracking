// Shared styling constants and design tokens
export const theme = {
  spacing: {
    xs: 0.5,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    xxl: 6,
  },

  layout: {
    pageContainer: {
      paddingX: { xs: 2, sm: 3 },
      height: 'calc(100vh - var(--navbar-height))',
      overflowY: 'auto',
    },
    centerContainer: {
      paddingX: { xs: 2, sm: 3 },
      height: 'calc(100vh - var(--navbar-height))',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    contentMaxWidth: '1200px',
    mobileContainer: {
      paddingX: 1,
      paddingY: 2,
    },
  },

  cards: {
    default: {
      elevation: 2,
      sx: {
        p: 3,
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          elevation: 4,
          borderColor: 'primary.light',
        },
      },
    },
    compact: {
      elevation: 1,
      sx: {
        p: 2,
        mb: 2,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'grey.200',
      },
    },
    interactive: {
      elevation: 2,
      sx: {
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          elevation: 6,
          transform: 'translateY(-2px)',
          borderColor: 'primary.main',
        },
      },
    },
    management: {
      elevation: 1,
      sx: {
        width: { xs: '100%', sm: 'fit-content' },
        minWidth: { xs: 'auto', sm: 280 },
        maxWidth: { xs: 'none', sm: 400 },
        flex: { xs: '1 1 auto', sm: '0 0 auto' },
        p: { xs: 2, sm: 2 },
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          elevation: 3,
          borderColor: 'primary.light',
        },
      },
    },
    featured: {
      elevation: 3,
      sx: {
        p: 3,
        mb: 2,
        borderRadius: 2,
        border: '2px solid',
        borderColor: 'primary.main',
        bgcolor: 'primary.50',
        transition: 'all 0.2s ease-in-out',
      },
    },
  },

  forms: {
    spacing: 2,
    buttonSpacing: 1,
    fieldMinWidth: 200,
  },

  typography: {
    pageTitle: {
      variant: 'h4',
      gutterBottom: true,
      sx: { mb: 3, fontWeight: 600 },
    },
    sectionTitle: {
      variant: 'h6',
      gutterBottom: true,
      sx: { mb: 2, fontWeight: 500 },
    },
  },

  breakpoints: {
    mobile: 'sm',
    tablet: 'md',
    desktop: 'lg',
  },

  buttons: {
    primary: {
      variant: 'contained',
      sx: {
        textTransform: 'none',
        fontWeight: 600,
        minHeight: 44,
        boxShadow: 2,
        '&:hover': {
          boxShadow: 4,
        },
        '&:focus-visible': {
          outline: '2px solid #1976d2',
          outlineOffset: '2px',
        },
      },
    },
    secondary: {
      variant: 'outlined',
      sx: {
        textTransform: 'none',
        fontWeight: 500,
        minHeight: 44,
        borderWidth: 2,
        '&:hover': {
          borderWidth: 2,
        },
        '&:focus-visible': {
          outline: '2px solid #1976d2',
          outlineOffset: '2px',
        },
      },
    },
    tertiary: {
      variant: 'text',
      sx: {
        textTransform: 'none',
        fontWeight: 500,
        minHeight: 44,
        '&:focus-visible': {
          outline: '2px solid #1976d2',
          outlineOffset: '2px',
        },
      },
    },
    action: {
      variant: 'contained',
      color: 'primary',
      size: 'medium',
      sx: {
        textTransform: 'none',
        fontWeight: 600,
        minWidth: 120,
        minHeight: 44,
        '&:focus-visible': {
          outline: '2px solid #1976d2',
          outlineOffset: '2px',
        },
      },
    },
    danger: {
      variant: 'outlined',
      color: 'error',
      sx: {
        textTransform: 'none',
        fontWeight: 500,
        minHeight: 44,
        borderWidth: 2,
        '&:hover': {
          borderWidth: 2,
        },
        '&:focus-visible': {
          outline: '2px solid #d32f2f',
          outlineOffset: '2px',
        },
      },
    },
    compact: {
      size: 'small',
      sx: {
        textTransform: 'none',
        minWidth: 'auto',
        minHeight: 36,
        '&:focus-visible': {
          outline: '2px solid #1976d2',
          outlineOffset: '2px',
        },
      },
    },
    icon: {
      sx: {
        minWidth: 44,
        minHeight: 44,
        '&:focus-visible': {
          outline: '2px solid #1976d2',
          outlineOffset: '2px',
        },
      },
    },
  },

  loadingStates: {
    skeleton: {
      animation: 'wave',
      variant: 'rounded',
      sx: {
        borderRadius: 1,
      },
    },
    cardSkeleton: {
      sx: {
        p: 2,
        mb: 2,
        borderRadius: 2,
        bgcolor: 'grey.100',
      },
    },
  },
};

// Common component styles
export const commonStyles = {
  formContainer: {
    mb: 3,
    p: 2,
    backgroundColor: 'grey.50',
    borderRadius: 2,
  },

  actionButtonGroup: {
    display: 'flex',
    gap: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  responsiveStack: {
    direction: { xs: 'column', sm: 'row' },
    spacing: 2,
    alignItems: { xs: 'stretch', sm: 'center' },
  },

  projectGrid: {
    direction: 'row',
    spacing: 1,
    justifyContent: 'center',
    flexWrap: 'wrap',
    maxWidth: '800px',
    mx: 'auto',
  },

  managementGrid: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    flexWrap: 'wrap',
    gap: { xs: 2, sm: 3 },
    justifyContent: 'flex-start',
  },

  cardGrid: {
    container: true,
    spacing: 3,
  },

  statusChip: {
    open: { color: 'info', variant: 'outlined' },
    in_progress: { color: 'warning', variant: 'filled' },
    resolved: { color: 'success', variant: 'filled' },
    closed: { color: 'default', variant: 'outlined' },
    rejected: { color: 'error', variant: 'outlined' },
  },

  priorityChip: {
    urgent: { color: 'error', variant: 'filled' },
    high: { color: 'warning', variant: 'filled' },
    medium: { color: 'info', variant: 'outlined' },
    low: { color: 'default', variant: 'outlined' },
  },

  emptyState: {
    textAlign: 'center',
    py: 6,
    px: 3,
    color: 'text.secondary',
  },

  tableContainer: {
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    overflow: 'hidden',
  },

  mobileOptimized: {
    touchTarget: {
      minHeight: 44,
      minWidth: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    largeTouchTarget: {
      minHeight: 48,
      minWidth: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    mobileTable: {
      display: { xs: 'none', md: 'table' },
    },
    mobileCards: {
      display: { xs: 'block', md: 'none' },
    },
    horizontalScroll: {
      overflowX: 'auto',
      '&::-webkit-scrollbar': {
        height: 8,
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 4,
      },
    },
  },

  accessibility: {
    focusRing: {
      '&:focus-visible': {
        outline: '2px solid #1976d2',
        outlineOffset: '2px',
      },
    },
    skipLink: {
      position: 'absolute',
      left: '-9999px',
      zIndex: 999,
      padding: '8px 16px',
      background: '#1976d2',
      color: 'white',
      textDecoration: 'none',
      '&:focus': {
        left: '6px',
        top: '6px',
      },
    },
    srOnly: {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0,
    },
  },
};
