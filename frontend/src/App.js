import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Bookings from './pages/Bookings';
import Favorites from './pages/Favorites';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import BusinessManagement from './pages/admin/BusinessManagement';
import BookingManagement from './pages/admin/BookingManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import BusinessList from './pages/BusinessList';
import BusinessDetails from './pages/BusinessDetails';
import CategoryDetails from './pages/CategoryDetails';
import Categories from './pages/Categories';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import BusinessOwnerRoute from './components/BusinessOwnerRoute';
import BusinessDashboard from './pages/BusinessDashboard';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Main Layout Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:id" element={<CategoryDetails />} />
            <Route path="/businesses" element={<BusinessList />} />
            <Route path="/businesses/:id" element={<BusinessDetails />} />

            {/* Protected User Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/settings" element={<Settings />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/favorites" element={<Favorites />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/services" element={<ServiceManagement />} />
              <Route path="/admin/businesses" element={<BusinessManagement />} />
              <Route path="/admin/bookings" element={<BookingManagement />} />
              <Route path="/admin/categories" element={<CategoryManagement />} />
              <Route path="/admin/payments" element={<PaymentManagement />} />
            </Route>

            {/* Business Owner Routes */}
            <Route element={<BusinessOwnerRoute />}>
              <Route path="/dashboard" element={<BusinessDashboard />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
