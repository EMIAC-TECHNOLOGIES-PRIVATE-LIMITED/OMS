import { useState, useEffect, useRef } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { NavLink, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authAtom } from '../../store/atoms/atoms';
import { signOut } from '../../utils/apiService/authAPI';

function LoggedInHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

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

  const permissions = auth.userInfo?.permissions || [];

  // useEffect(() => {
  //   console.log('The auth object state currently is : ', auth);
  // }, [auth]);

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
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="hidden md:block bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-neutral-700 hover:text-brand hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand transition duration-300"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu" ref={mobileMenuRef}>
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3 animate-fadeIn scale-in">
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
            <div className="mt-3 px-3">
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
