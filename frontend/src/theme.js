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
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: 'Poppins, sans-serif',
      fontSize: '3.5rem',
      fontWeight: 800,
      color: '#222',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: 'Poppins, sans-serif',
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#222',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: 'Poppins, sans-serif',
      fontSize: '2rem',
      fontWeight: 700,
      color: '#222',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: 'Poppins, sans-serif',
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#222',
      letterSpacing: '-0.01em',
    },
    h5: {
      fontFamily: 'Poppins, sans-serif',
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#222',
    },
    h6: {
      fontFamily: 'Poppins, sans-serif',
      fontSize: '1.1rem',
      fontWeight: 600,
      color: '#222',
    },
    subtitle1: {
      fontSize: '1.1rem',
      fontWeight: 500,
      color: '#444',
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontSize: '0.95rem',
      fontWeight: 500,
      color: '#666',
      letterSpacing: '0.01em',
    },
    body1: {
      fontSize: '1rem',
      color: '#444',
      letterSpacing: '0.01em',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.95rem',
      color: '#666',
      letterSpacing: '0.01em',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.85rem',
      color: '#666',
      letterSpacing: '0.02em',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
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
          letterSpacing: '0.02em',
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
