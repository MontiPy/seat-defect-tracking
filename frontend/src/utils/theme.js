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
      paddingX: 3,
      height: 'calc(100vh - var(--navbar-height))',
      overflowY: 'auto',
    },
    centerContainer: {
      paddingX: 3,
      height: 'calc(100vh - var(--navbar-height))',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    contentMaxWidth: '1200px',
  },

  cards: {
    default: {
      elevation: 2,
      sx: {
        p: 3,
        mb: 2,
        borderRadius: 2,
      },
    },
    compact: {
      elevation: 1,
      sx: {
        p: 2,
        mb: 2,
        borderRadius: 1,
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
};
