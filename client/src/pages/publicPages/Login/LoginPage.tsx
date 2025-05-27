import React, { useState, lazy, Suspense } from 'react';
import { useRecoilState } from 'recoil';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { authAtom } from '../../../store/atoms/atoms';
import { signIn } from '../../../utils/apiService/authAPI';

import { Button } from '@/components/ui/button';
import { FlipWords } from './FlipWords';
import { StarsBackground } from './stars-background';
import { ShootingStars } from './shooting-stars';
import sampleArcs from './SampleArcs';

const World = lazy(() =>
  import("./globe").then((m) => ({
    default: m.World,
  }))
);

interface LocationState {
  from?: {
    pathname: string;
  };
  message?: string;
}

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  error: string | null;
}

// Separate login form component to handle state changes
const LoginForm = React.memo(({ onLogin, error }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior
    onLogin(email, password);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="bg-white shadow-lg w-96 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-600 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-600 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">
              {error}
            </p>
          )}

          <Button
            type="submit" // Change to type="submit" for form submission
            variant="brand"
            className="w-full bg-red-600"
          >
            Login
          </Button>
        </form>

        <div className="mt-6 text-center">
          Forgot Password?
          <br />
          Please Contact the Admin.
        </div>
      </div>
    </motion.div>
  );
});

// Separate globe visualization component
const GlobeVisualization = React.memo(() => {
  const globeConfig = {
    pointSize: 4,
    globeColor: "#062056",
    showAtmosphere: true,
    atmosphereColor: "#FFFFFF",
    atmosphereAltitude: 0.1,
    emissive: "#062056",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    polygonColor: "rgba(255,255,255,0.7)",
    ambientLight: "#38bdf8",
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    arcTime: 1000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    initialPosition: { lat: 22.3193, lng: 114.1694 },
    autoRotate: true,
    autoRotateSpeed: 0.5,
  };

  return (
    <div className="flex flex-row items-center justify-center py-20 h-screen md:h-auto relative w-full z-20">
      <div className="max-w-7xl mx-auto w-full relative overflow-hidden h-full md:h-[40rem] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="div"
        >
          <h2 className="text-center text-xl md:text-4xl font-bold text-white dark:text-white">
            Connecting{" "}
            <FlipWords
              words={["Domains", "Businesses", "You"]}
              duration={3000}
              className="inline-block"
            />
            Worldwide
          </h2>
          <p className="text-center text-sm md:text-lg text-white dark:text-white italic">
            Putting You on the Map of Search Engine Success.
          </p>
        </motion.div>

        <div className="absolute w-full -bottom-20 h-72 md:h-full z-10">
          <Suspense fallback={<div>Loading the 3D Globe...</div>}>
            <World data={sampleArcs} globeConfig={globeConfig} />
          </Suspense>
        </div>
      </div>
    </div>
  );
});

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useRecoilState(authAtom);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await signIn(email, password);
      const { data } = response;

      setAuth({
        isAuthenticated: true,
        loading: false,
        userInfo: data,
      });

      const from = state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    }
  };

  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex items-stretch h-screen">
      <div className="relative w-1/2 h-svh space-y-4 bg-slate-100 overflow-hidden">
        <div className="absolute w-1/4 h-[45%] bg-brand-dark rounded-full -left-[15%] -top-[25%] blur-[100px] opacity-30" />
        <div className="absolute w-1/4 h-[45%] bg-brand-dark rounded-full -right-[15%] -bottom-[25%] blur-[100px] opacity-30" />

        <div className="m-6">
          <img
            src="/i2.png"
            alt="App Logo"
            className="h-12"
          />
        </div>

        <div className="w-full h-full flex items-center justify-center">
          <LoginForm onLogin={handleLogin} error={error} />
        </div>
      </div>

      <div className="w-1/2 space-y-4 bg-black relative overflow-hidden">
        <StarsBackground
          starDensity={0.005}
          allStarsTwinkle={true}
          twinkleProbability={0.8}
          minTwinkleSpeed={0.5}
          maxTwinkleSpeed={1}
          className="absolute inset-0 z-0"
        />

        <ShootingStars
          minSpeed={5}
          maxSpeed={12}
          minDelay={600}
          maxDelay={1100}
          starColor="#FFFFFF"
          trailColor="#FFD700"
          starWidth={8}
          starHeight={2}
          className="absolute inset-0 z-10"
        />

        <GlobeVisualization />
      </div>
    </div>
  );
};

export default LoginPage;