import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { store } from './store/index';
import { AuthProvider } from './contexts/AuthContext';
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
import TrainingProgramManagement from './pages/admin/TrainingProgramManagement';
import BusinessList from './pages/BusinessList';
import BusinessDetails from './pages/BusinessDetails';
import CategoryDetails from './pages/CategoryDetails';
import Categories from './pages/Categories';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import BusinessOwnerRoute from './components/BusinessOwnerRoute';
import BusinessDashboard from './pages/BusinessDashboard';
import BusinessProfileCreate from './pages/BusinessProfileCreate';
import AboutUs from './pages/AboutUs';
import DashboardHome from './pages/admin/DashboardHome';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* Main Layout Routes */}
                <Route element={<Layout />}>
                  <Route path="/about" element={<AboutUs />} />
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
                    <Route path="/admin/dashboard" element={<AdminDashboard />}>
                      <Route index element={<DashboardHome />} />
                      <Route path="users" element={<UserManagement />} />
                      <Route path="services" element={<ServiceManagement />} />
                      <Route path="businesses" element={<BusinessManagement />} />
                      <Route path="bookings" element={<BookingManagement />} />
                      <Route path="categories" element={<CategoryManagement />} />
                      <Route path="payments" element={<PaymentManagement />} />
                      <Route path="training-programs" element={<TrainingProgramManagement />} />
                    </Route>
                  </Route>

                  {/* Business Owner Routes */}
                  <Route element={<BusinessOwnerRoute />}>
                    <Route path="/business/dashboard" element={<BusinessDashboard />} />
                    <Route path="/business/profile/create" element={<BusinessProfileCreate />} />
                  </Route>
                </Route>
              </Routes>
            </Router>
          </SnackbarProvider>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
