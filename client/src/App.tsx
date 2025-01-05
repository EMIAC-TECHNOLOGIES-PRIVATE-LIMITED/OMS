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
import Home from './components/Home/Home';
import DashboardLayout from './components/DashBoard/DashboardLayout';
import ManageRoles from './components/DashBoard/ManageRoles';
import EditRole from './components/DashBoard/EditRole';
import ManageUsers from './components/DashBoard/ManageUsers';
import EditUser from './components/DashBoard/EditUser';
import Sites from './pages/protectedPages/dataPages/Sites';
import Vendors from './pages/protectedPages/dataPages/Vendors';
import LoginPage from './pages/publicPages/LoginPage';
import Clients from './pages/protectedPages/dataPages/Clients';
import Orders from './pages/protectedPages/dataPages/Orders';
import Unauthorized from './pages/publicPages/Unauthorized'; // New component
import NotFound from './pages/publicPages/NotFound'; // Ensure this exists

const ProtectedRoute = ({ allowedRoles = [] }: { allowedRoles?: string[] }) => {
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

  if (allowedRoles.length > 0 && !allowedRoles.includes(userInfo.role.name)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location, message: 'You do not have permission to view this page.' }}
      />
    );
  }

  return <Outlet />;
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

        {/* Public Routes */}
        <Route path="login" element={<LoginPage />} />

        {/* Unauthorized Route */}
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Dashboard Routes */}
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="manageroles" replace />} />
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





// import { useEffect } from 'react';
// import {
//   RouterProvider,
//   createBrowserRouter,
//   createRoutesFromElements,
//   Route,
//   Navigate,
//   Outlet,
// } from 'react-router-dom';
// import { useRecoilValue, useSetRecoilState } from 'recoil';
// import { authAtom } from "./store/atoms/atoms";
// import { getUserInfo } from './utils/apiService/userAPI';
// import Layout from './Layout';
// import Home from './components/Home/Home';
// import DashboardLayout from './components/DashBoard/DashboardLayout';
// import ManageRoles from './components/DashBoard/ManageRoles';
// import EditRole from './components/DashBoard/EditRole';
// import ManageUsers from './components/DashBoard/ManageUsers';
// import EditUser from './components/DashBoard/EditUser';
// import Sites from './pages/protectedPages/dataPages/Sites';
// import Vendors from './pages/protectedPages/dataPages/Vendors';
// import LoginPage from './pages/publicPages/LoginPage';
// import Clients from './pages/protectedPages/dataPages/Clients';
// import Orders from './pages/protectedPages/dataPages/Orders';

// const ProtectedRoute = ({ allowedRoles = [] }: { allowedRoles?: string[] }) => {
//   const { isAuthenticated, loading, userInfo } = useRecoilValue(authAtom);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" />;
//   }

//   if (allowedRoles.length > 0 && !allowedRoles.includes(userInfo.role.name)) {
//     return <Navigate to="/login" />;
//   }

//   return <Outlet />;
// };

// // Conditional Home Route
// const HomeRoute = () => {
//   const { isAuthenticated } = useRecoilValue(authAtom);
//   return isAuthenticated ? <Navigate to="/dashboard" /> : <Home />;
// };

// // Router Configuration
// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <>
//       <Route path="/" element={<Layout />}>
//         <Route index element={<HomeRoute />} />

//         {/* Public Route */}
//         <Route path="login" element={<LoginPage />} />

//         {/* Protected Routes */}
//         <Route element={<ProtectedRoute />}>
//           {/* Dashboard Routes */}
//           <Route path="dashboard" element={<DashboardLayout />}>
//             <Route index element={<Navigate to="manageroles" replace />} />
//             <Route path="manageroles" element={<ManageRoles />} />
//             <Route path="manageroles/:roleId" element={<EditRole />} />
//             <Route path="manageusers" element={<ManageUsers />} />
//             <Route path="manageusers/:userId" element={<EditUser />} />
//           </Route>

//           {/* Other Protected Routes */}
//           <Route path="site" element={<Sites />} />
//           <Route path="vendor" element={<Vendors />} />
//           <Route path="client" element={<Clients />} />
//           <Route path="order" element={<Orders />} />
//         </Route>
//       </Route>
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </>
//   )
// );

// function App() {
//   const setAuth = useSetRecoilState(authAtom);

//   useEffect(() => {
//     const fetchAuth = async () => {
//       try {
//         const userInfo = await getUserInfo();
//         const { data } = userInfo;

//         setAuth({
//           isAuthenticated: true,
//           loading: false,
//           userInfo: data,
//         });
//       } catch (error) {
//         setAuth({
//           isAuthenticated: false,
//           loading: false,
//           userInfo: {
//             id: 0,
//             name: '',
//             role: {
//               id: 0,
//               name: '',
//             },
//             email: '',
//             permissions: [],
//           },
//         });
//       }
//     };
//     fetchAuth();
//   }, [setAuth]);

//   return <RouterProvider router={router} />;
// }

// export default App;

