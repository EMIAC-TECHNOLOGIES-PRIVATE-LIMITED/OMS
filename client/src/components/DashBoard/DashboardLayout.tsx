import React from 'react';
import Sidebar from './SideBar';
import { Outlet } from 'react-router-dom';

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        {/* Watermark Image */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none z-0 flex items-center justify-center"
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
        >
          <img
            src="/image.png" // Ensure the path is correct
            alt="Watermark"
            className="w-full h-full object-cover opacity-5"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;