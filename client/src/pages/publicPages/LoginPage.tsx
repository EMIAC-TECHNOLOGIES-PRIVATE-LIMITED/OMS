import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { authAtom } from '../../store/atoms/atoms';
import { signIn } from '../../utils/apiService/authAPI';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [, setAuth] = useRecoilState(authAtom);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);
    try {
      const response = await signIn(email, password);

      const { data } = response;

      setAuth({
        isAuthenticated: true,
        loading: false,
        userInfo: data,
      });

      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* Logo */}
      <div className="mb-6">
        <img
          src="/i2.png" 
          alt="App Logo"
          className="h-12"
        />
      </div>

      {/* Login Card */}
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Welcome Back
        </h2>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-gray-600 font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <label className="block text-gray-600 font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-brand text-white py-3 rounded-lg font-medium hover:bg-brand-dark transition-all duration-300"
        >
          Login
        </button>

        {/* Additional Links */}
        <div className="mt-6 text-center">
          <a
            href="/forgot-password"
            className="text-sm text-brand hover:underline"
          >
            Forgot Password?
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-gray-500 text-sm">
        © {new Date().getFullYear()} Your Company Name. All rights reserved.
      </div>
    </div>
  );
};

export default LoginPage;
