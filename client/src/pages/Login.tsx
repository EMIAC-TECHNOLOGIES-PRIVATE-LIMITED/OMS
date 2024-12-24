import React, { useState } from 'react';
import { signIn } from '../utils/apiService/authAPI';
import { useSetRecoilState } from 'recoil';
import { authAtom } from '../store/atoms/atoms';

interface LoginFormProps { }

const LoginForm: React.FC<LoginFormProps> = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const setIsAuthenticated = useSetRecoilState(authAtom);

  const handleSignIn = async () => {
    try {
      setError(null); // Reset any existing error
      const response = await signIn(email, password);
      
      console.log(response);
      if (response.success) {
        setIsAuthenticated({
          isAuthenticated: true,
          role: response.role.name,
          email: null,
          permissions: response.permissions.map((p) => p.name),
        });
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Log in to Resend</h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          Don’t have an account?{' '}
          <a href="#" className="text-indigo-500 hover:underline">
            Sign up
          </a>
        </p>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="alan.turing@example.com"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="********"
          />
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <button
          onClick={handleSignIn}
          className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 rounded-md text-white font-semibold transition duration-300"
        >
          Continue →
        </button>

        <div className="mt-4 text-center">
          <a href="#" className="text-sm text-gray-400 hover:text-indigo-500">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
};



export default LoginForm;
