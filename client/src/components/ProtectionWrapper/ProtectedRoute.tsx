import { Navigate, Outlet } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../../store/atoms/atoms';

const ProtectedRoute = () => {
  const { isAuthenticated } = useRecoilValue(authAtom);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
