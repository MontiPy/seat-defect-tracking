import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontSize: 12,
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '1.8rem',
    },
    h2: {
      fontSize: '1.6rem',
    },
    h3: {
      fontSize: '1.4rem',
    },
    h4: {
      fontSize: '1.2rem',
    },
    h5: {
      fontSize: '1.1rem',
    },
    h6: {
      fontSize: '1rem',
    },
    body1: {
      fontSize: '0.85rem',
    },
    body2: {
      fontSize: '0.8rem',
    },
    button: {
      fontSize: '0.8rem',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.7rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '0.8rem',
          padding: '4px 8px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            fontSize: '0.85rem',
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.85rem',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontSize: '0.85rem',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.85rem',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.8rem',
          padding: '4px 8px',
        },
        head: {
          fontSize: '0.8rem',
          fontWeight: 'bold',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: '4px',
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            fontSize: '0.85rem',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.85rem',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '40px !important',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          '& .MuiTypography-root': {
            fontSize: '0.9rem',
          },
        },
      },
    },
  },
});

export default theme;
