import { Navigate, Outlet } from 'react-router-dom';
import { getCookie } from '../utils/cookie';

const PublicRoute = () => {
  const token = getCookie('token'); 
  const refreshToken = getCookie('refreshToken'); 

  if (token || refreshToken) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;