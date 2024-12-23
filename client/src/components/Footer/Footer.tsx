// src/components/Footer.tsx

import React from 'react';

function Footer() {
  return (
    <footer className="bg-brand text-white py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Company Name */}
        <div className="mb-4 md:mb-0">
          <h1 className="text-xl font-bold">EMIAC Technologies</h1>
        </div>
        
        {/* Navigation Links */}
        <div className="flex space-x-6 mb-4 md:mb-0">
          <a href="/about" className="hover:underline">About</a>
          <a href="/services" className="hover:underline">Services</a>
          <a href="/contact" className="hover:underline">Contact</a>
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
        </div>
        
        {/* Social Media Links */}
        <div className="flex space-x-4">
          <a href="https://facebook.com" aria-label="Facebook" className="hover:text-gray-300">
            <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.764v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.403 24 24 23.403 24 22.675V1.325C24 .597 23.403 0 22.675 0z"/>
            </svg>
          </a>
          <a href="https://twitter.com" aria-label="Twitter" className="hover:text-gray-300">
            <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724 9.864 9.864 0 0 1-3.127 1.195 4.916 4.916 0 0 0-8.384 4.482A13.944 13.944 0 0 1 1.671 3.149a4.916 4.916 0 0 0 1.523 6.573 4.897 4.897 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 0 1-2.224.084 4.918 4.918 0 0 0 4.588 3.417A9.868 9.868 0 0 1 0 19.54a13.94 13.94 0 0 0 7.548 2.212c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/>
            </svg>
          </a>
          <a href="https://linkedin.com" aria-label="LinkedIn" className="hover:text-gray-300">
            <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M22.23 0H1.77C.597 0 0 .774 0 1.727v20.545C0 23.226.597 24 1.77 24h20.46C23.403 24 24 23.226 24 22.272V1.727C24 .774 23.403 0 22.23 0zM7.09 20.452H3.545V9h3.545v11.452zM5.317 7.433a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM20.452 20.452h-3.546v-5.604c0-1.337-.025-3.063-1.868-3.063-1.869 0-2.156 1.46-2.156 2.967v5.707h-3.545V9h3.413v1.561h.041c.476-.76 1.637-1.56 3.372-1.56 3.606 0 4.271 2.371 4.271 5.455v6.285z"/>
            </svg>
          </a>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-4 text-center text-sm">
        &copy; {new Date().getFullYear()} EMIAC Technologies. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer;
