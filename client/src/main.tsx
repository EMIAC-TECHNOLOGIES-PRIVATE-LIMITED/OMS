import React from 'react'
import ReactDOM from 'react-dom/client'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements, Navigate, Outlet } from 'react-router-dom'
import './index.css'
import Home from './components/Home/Home'
import Layout from './Layout'
import Sites from './pages/Sites'
import { RecoilRoot, useRecoilValue } from 'recoil'
import Vendors from './pages/Vendors'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import { authAtom } from './store/atoms/atoms'

// Protected Route Component
const ProtectedRoute = () => {
  const { isAuthenticated } = useRecoilValue(authAtom);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

// Conditional Home Route
const HomeRoute = () => {
  const { isAuthenticated } = useRecoilValue(authAtom);
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Home />;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout />}>
      {/* Conditional rendering of '/' route */}
      <Route index element={<HomeRoute />} />
      <Route path='login' element={<Login />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='Sites' element={<Sites />} />
        <Route path='Vendors' element={<Vendors />} />
      </Route>
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RecoilRoot>
      <RouterProvider router={router} />
    </RecoilRoot>
  </React.StrictMode>,
)
