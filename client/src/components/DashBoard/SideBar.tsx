import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Sidebar: React.FC = () => {
  const menuItems = [
    { name: 'Manage Roles', path: 'manageroles', icon: ShieldCheckIcon },
    { name: 'Manage Users', path: 'manageusers', icon: UserIcon },
  ];

  return (
    <motion.div
      className="bg-neutral-100 p-4 border-r border-neutral-200 h-full"
      initial={{ width: '4rem', opacity: 0 }}
      animate={{ width: '16rem', opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="flex items-center justify-center mb-6">
        <h3 className="text-xl font-semibold text-neutral-800">Admin Dashboard</h3>
      </div>

      {/* Menu Items */}
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-4">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md transition-colors duration-300 ${
                    isActive
                      ? 'bg-brand text-white'
                      : 'text-neutral-700 hover:bg-brand-light hover:text-white'
                  }`
                }
              >
                <item.icon className="w-6 h-6" />
                <span className="ml-3">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
};

export default Sidebar;
