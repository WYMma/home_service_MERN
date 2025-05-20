import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { updateUserData } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        dispatch(updateUserData(userData));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, [dispatch]);

  const setUser = (userData) => {
    dispatch(updateUserData(userData));
  };

  return {
    user,
    setUser,
    isLoading,
    isError,
    isSuccess,
    message,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isBusiness: user?.role === 'business',
  };
};

export default useAuth;
