import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('vyomacre_token');
  const savedUser = localStorage.getItem('vyomacre_user');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && savedUser) {
    try {
      const user = JSON.parse(savedUser);
      if (user.role !== allowedRole) {
        return <Navigate to={user.role === 'owner' ? '/owner-dashboard' : '/seeker-dashboard'} replace />;
      }
    } catch (e) {
      console.error('Error parsing user session', e);
    }
  }

  return children;
};

export default ProtectedRoute;