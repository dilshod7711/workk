import { Navigate, Outlet } from 'react-router-dom';
import { getCookie } from '../utils/cookie';

const ProtectedRoute = () => {
  const token = getCookie('token'); 
  const refreshToken = getCookie('refreshToken'); 

  if (!token && !refreshToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;