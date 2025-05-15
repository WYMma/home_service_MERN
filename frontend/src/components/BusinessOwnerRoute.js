import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const BusinessOwnerRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'business') {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default BusinessOwnerRoute; 