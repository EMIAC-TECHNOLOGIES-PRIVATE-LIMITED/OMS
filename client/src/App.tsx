// App.tsx
import { useEffect } from 'react';
import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authAtom } from "./store/atoms/atoms";
import { getUserInfo } from './utils/apiService/userAPI';
import Layout from './Layout';
import ManageRoles from './components/DashBoard/ManageRoles';
import EditRole from './components/DashBoard/EditRole';
import ManageUsers from './components/DashBoard/ManageUsers';
import EditUser from './components/DashBoard/EditUser';
import Sites from './pages/protectedPages/dataPages/Sites';
import Vendors from './pages/protectedPages/dataPages/Vendors';
import LoginPage from './pages/publicPages/Login/LoginPage';
import Clients from './pages/protectedPages/dataPages/Clients';
import Orders from './pages/protectedPages/dataPages/Orders';
import Unauthorized from './pages/publicPages/Unauthorized';
import NotFound from './pages/publicPages/NotFound';
import Tools from './pages/protectedPages/dataPages/Tools/Tools';
import Test from './pages/publicPages/Test';
import Page from './components/DashBoard/AdminDashboard/page';

import SystemPerformanceMonitor from './components/DashBoard/AdminDashboard/components/monitor-activity';
import MonitorUsers from './components/DashBoard/AdminDashboard/components/monitor-users';
import UserDashboard from './components/DashBoard/UserDashboard';


const ProtectedRoute = () => {
  const { isAuthenticated, loading, userInfo } = useRecoilValue(authAtom);
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location, message: 'You need to log in first.' }}
      />
    );
  }
  const topLevelRoute = location.pathname.split('/')[1];

  if (userInfo.permissions.some(permission => permission.name === topLevelRoute || permission.name === `_${topLevelRoute}`)) {
    return <Outlet />;
  }

  return (
    <Navigate
      to="/unauthorized"
      replace
      state={{ from: location, message: 'You do not have permission to view this page.' }}
    />
  );

};

// Conditional Home Route
const HomeRoute = () => {
  const { isAuthenticated } = useRecoilValue(authAtom);
  return isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />;
};

const DashboardRoute = () => {
  const { userInfo } = useRecoilValue(authAtom);
  return userInfo.role.name === 'Admin' ? <Page /> : <UserDashboard />;
}

// Router Configuration
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomeRoute />} />

        {/* Public Routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="test" element={<Test />} />

        {/* Unauthorized Route */}
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Dashboard Routes */}
          <Route path="dashboard" element={<DashboardRoute />}>
            <Route index element={<Navigate to="dashboard/stats/users" replace />} />
            <Route path="stats/users" element={<MonitorUsers />} />
            <Route path="stats/system" element={<SystemPerformanceMonitor />} />
            <Route path="manageroles" element={<ManageRoles />} />
            <Route path="manageroles/:roleId" element={<EditRole />} />
            <Route path="manageusers" element={<ManageUsers />} />
            <Route path="manageusers/:userId" element={<EditUser />} />
          </Route>

          {/* Other Protected Routes */}
          <Route path="site" element={<Sites />} />
          <Route path="vendor" element={<Vendors />} />
          <Route path="client" element={<Clients />} />
          <Route path="order" element={<Orders />} />
          <Route path="tools" element={<Tools />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </>
  )
);

function App() {
  const setAuth = useSetRecoilState(authAtom);

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const userInfo = await getUserInfo();
        const { data } = userInfo;

        setAuth({
          isAuthenticated: true,
          loading: false,
          userInfo: data,
        });
      } catch (error) {
        setAuth({
          isAuthenticated: false,
          loading: false,
          userInfo: {
            id: 0,
            name: '',
            role: {
              id: 0,
              name: '',
            },
            email: '',
            permissions: [],
          },
        });
      }
    };
    fetchAuth();
  }, [setAuth]);

  return <RouterProvider router={router} />;
}

export default App;





