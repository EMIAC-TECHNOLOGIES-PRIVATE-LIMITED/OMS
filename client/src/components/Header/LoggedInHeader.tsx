import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { motion, AnimatePresence } from 'framer-motion';
import { authAtom } from '../../store/atoms/atoms';
import { signOut } from '../../utils/apiService/authAPI';
import { Button } from '../ui/button';

function LoggedInHeader() {
  const [isMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const profileModalRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const auth = useRecoilValue(authAtom);
  const setAuth = useSetRecoilState(authAtom);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      setAuth({
        loading: false,
        isAuthenticated: false,
        userInfo: {
          id: 0,
          email: '',
          permissions: [],
          name: '',
          role: {
            id: 0,
            name: ''
          },
        }
      });

      //clear local storage
      localStorage.clear();


      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileModalRef.current &&
        !profileModalRef.current.contains(event.target as Node)
      ) {
        setIsProfileModalOpen(false);
      }
    };

    if (isProfileModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileModalOpen]);

  const handleProfileButtonClick = () => {
    setIsProfileModalOpen((prev) => !prev); // Toggle modal open/close state
  };

  if (auth.loading) {
    return (
      <header className="bg-white shadow-premium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 animate-pulse">
            <div className="flex">
              <div className="h-8 w-24 bg-gray-300 rounded"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-12 bg-gray-300 rounded"></div>
              <div className="h-8 w-12 bg-gray-300 rounded"></div>
              <div className="h-8 w-12 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }


  let permissions = [...(auth.userInfo?.permissions || [])];

  permissions.sort((a, b) => a.name.localeCompare(b.name));
  permissions = permissions.filter((item) => item.name.charAt(0) !== '_');

  console.log(permissions);


  return (
    <header className="bg-white shadow-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="/i2.png"
                alt="Company Logo"
              />
            </div>
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              {permissions.map((item) => (
                <NavLink
                  key={item.id}
                  to={`/${item.name.toLowerCase()}`}
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive
                      ? 'border-brand text-brand'
                      : 'border-transparent text-neutral-700 hover:border-brand hover:text-brand'
                    } transition-colors duration-300`
                  }
                >
                  {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {/* User Icon */}
            <div className="relative" ref={profileModalRef}>
              <button
                onClick={handleProfileButtonClick}
                className="w-10 h-10 rounded-full border-2 border-brand bg-gray-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-dark transition"
              >
                <img
                  src="/user.png"
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full"
                />
              </button>

              {/* Profile Modal */}
              <AnimatePresence>
                {isProfileModalOpen && (
                  <motion.div
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute top-12 right-0 bg-white shadow-lg rounded-lg p-4 w-64 z-50"
                    style={{
                      boxShadow:
                        '0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <img
                        src="/user.png" // Replace with user's avatar
                        alt="User Avatar"
                        className="w-16 h-16 rounded-full border-2 border-brand"
                      />
                      <h2 className="mt-2 text-lg font-bold text-neutral-800">
                        {auth.userInfo?.name}
                      </h2>
                      <p className="text-sm text-neutral-600">{(auth.userInfo.role.name)}</p>
                      <Button
                        variant="destructive"
                        onClick={handleLogout}

                      >
                        Logout
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu" ref={mobileMenuRef}>
          <nav className="px-2 pt-2  pb-3 space-y-1 sm:px-3">
            {permissions.map((item) => (
              <NavLink
                key={item.id}
                to={`/${item.name.toLowerCase()}`}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100 hover:text-brand transition-colors duration-300 ${isActive ? 'text-brand' : 'text-neutral-700'
                  }`
                }
              >
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </NavLink>
            ))}
            <div className="mt-3 px-3 ">
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default LoggedInHeader;
