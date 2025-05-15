import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FFB800',
      light: '#FFF4D6',
      dark: '#E6A600',
      contrastText: '#000000',
    },
    secondary: {
      main: '#FFB800',
      light: '#FFF4D6',
      dark: '#E6A600',
      contrastText: '#000000',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#222',
      secondary: '#666',
    },
    success: {
      main: '#FFB800',
    },
    info: {
      main: '#1976d2',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.8rem',
      fontWeight: 700,
      color: '#222',
    },
    h2: {
      fontSize: '2.2rem',
      fontWeight: 700,
      color: '#222',
    },
    h3: {
      fontSize: '1.7rem',
      fontWeight: 600,
      color: '#222',
    },
    h4: {
      fontSize: '1.3rem',
      fontWeight: 600,
      color: '#222',
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 600,
      color: '#222',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#222',
    },
    body1: {
      fontSize: '1rem',
      color: '#444',
    },
    body2: {
      fontSize: '0.95rem',
      color: '#666',
    },
    button: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: 'none',
        },
        containedPrimary: {
          backgroundColor: '#FFB800',
          '&:hover': {
            backgroundColor: '#F57C00',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(255,184,0,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#FFB800',
          color: '#333',
          boxShadow: '0 2px 8px rgba(255,184,0,0.08)',
        },
      },
    },
  },
});

export default theme;
