import { useSelector, useDispatch } from 'react-redux';
import { createAsyncThunk } from '@reduxjs/toolkit';

// Create an async thunk for updating user
export const updateUserData = createAsyncThunk(
  'auth/updateUser',
  async (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  }
);

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

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
