// src/components/Header.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'; // Corrected icon imports

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navigation = [
    { name: 'Home', href: '/dashboard' },
    { name: 'Clients', href: '/users' },
    { name: 'Sites', href: '/Sites' },
    { name: 'Vendors', href: '/reports' },
  ];

  // Close mobile menu when clicking outside
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

  return (
    <header className="bg-white shadow-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side: Logo and Navigation */}
          <div className="flex">
            {/* Company Logo */}
            <div className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="/i2.png" // Ensure the logo is placed in public/images/logo.png
                alt="Company Logo"
              />
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    window.location.pathname === item.href
                      ? 'border-brand text-brand'
                      : 'border-transparent text-neutral-700 hover:border-brand hover:text-brand'
                  } transition-colors duration-300`}
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
          {/* Right side: Project Name and Mobile Menu Button */}
          <div className="flex items-center">
            {/* Project Name */}
            <div className="hidden md:block text-lg font-semibold text-neutral-800">
              Outreach Platform
            </div>
            {/* Mobile Menu Button */}
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

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu" ref={mobileMenuRef}>
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3 animate-fadeIn scale-in">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100 hover:text-brand transition-colors duration-300"
              >
                {item.name}
              </a>
            ))}
            {/* Project Name in Mobile Menu */}
            <div className="mt-3 px-3">
              <span className="text-lg font-semibold text-neutral-800">
                Outreach Platform
              </span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
