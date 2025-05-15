import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Navbar';
import Footer from './Footer';
import { Box } from '@mui/material';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Box 
        component="main" 
        className="flex-grow container mx-auto px-4 py-8"
        sx={{ 
          pt: { xs: '80px', md: '90px' }, // Add padding-top to account for fixed navbar
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Outlet />
      </Box>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default Layout;
