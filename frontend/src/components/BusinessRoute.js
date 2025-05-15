import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const BusinessRoute = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'business') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default BusinessRoute; 