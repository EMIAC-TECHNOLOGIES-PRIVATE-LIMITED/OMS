import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route, Navigate, Outlet } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authAtom } from './store/atoms/atoms';
import { getUserInfo } from './utils/apiService/userAPI';
import Layout from './Layout';
import Home from './components/Home/Home';
import Dashboard from './pages/Dashboard';
import Sites from './pages/protectedPages/dataPages/Sites';
import Vendors from './pages/protectedPages/dataPages/Vendors';
import LoginPage from './pages/publicPages/LoginPage';
import Clients from './pages/protectedPages/dataPages/Clients';
import Orders from './pages/protectedPages/dataPages/Orders';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useRecoilValue(authAtom);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

// Conditional Home Route
const HomeRoute = () => {
  const { isAuthenticated } = useRecoilValue(authAtom);
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Home />;
};



// Router Configuration
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomeRoute />} />

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="site" element={<Sites />} />
          <Route path="vendor" element={<Vendors />} />
          <Route path="client" element={<Clients />} />
          <Route path="order" element={<Orders />} />
        </Route>
      </Route>
      <Route path="login" element={<LoginPage />} />
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
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
