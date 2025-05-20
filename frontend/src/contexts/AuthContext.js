import { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isBusiness, setIsBusiness] = useState(false);

  useEffect(() => {
    if (user) {
      setIsBusiness(user.role === 'business');
    } else {
      setIsBusiness(false);
    }
  }, [user]);

  const value = {
    user,
    isAuthenticated,
    isBusiness
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 