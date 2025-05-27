import React, { useState, lazy, Suspense, useEffect } from 'react';
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

// WebGL Detection Utility
const detectWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = (
      canvas.getContext('webgl2') as WebGL2RenderingContext || 
      canvas.getContext('webgl') as WebGLRenderingContext || 
      canvas.getContext('experimental-webgl') as WebGLRenderingContext
    );
    
    if (!gl) {
      return {
        supported: false,
        reason: 'WebGL not supported by browser'
      };
    }

    // Test basic WebGL functionality
    const shader = gl.createShader(gl.VERTEX_SHADER);
    if (!shader) {
      return {
        supported: false,
        reason: 'Cannot create WebGL shader'
      };
    }
    gl.deleteShader(shader);

    // Get renderer info for performance assessment
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';
    const isSoftwareRenderer = renderer.toLowerCase().includes('software') ||
                              renderer.toLowerCase().includes('swiftshader') ||
                              renderer.toLowerCase().includes('llvmpipe');

    // Clean up
    const loseContext = gl.getExtension('WEBGL_lose_context');
    if (loseContext) {
      loseContext.loseContext();
    }

    return {
      supported: true,
      version: gl.getParameter(gl.VERSION),
      renderer,
      isSoftwareRenderer,
      performanceLevel: isSoftwareRenderer ? 'low' : 'high'
    };
    
  } catch (error) {
    return {
      supported: false,
      reason: `WebGL detection failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

// Static Fallback Components
const StaticStarsBackground = React.memo(() => {
  const stars = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.8 + 0.2,
    animationDelay: Math.random() * 4
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.animationDelay}s`,
            animationDuration: '3s'
          }}
        />
      ))}
    </div>
  );
});

const StaticShootingStars = React.memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Static shooting star trails */}
      <div className="absolute top-1/4 left-1/4 w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform rotate-45 opacity-60 animate-pulse" />
      <div className="absolute top-3/4 right-1/3 w-12 h-0.5 bg-gradient-to-r from-transparent via-yellow-300 to-transparent transform rotate-12 opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/3 w-20 h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent transform -rotate-12 opacity-50 animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
});

const StaticFlipWords = React.memo(({ words, className }: { words: string[], className?: string }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [words]);

  return (
    <span className={`text-brand transition-all duration-500 ${className}`}>
      {words[currentWordIndex]}
    </span>
  );
});

const StaticGlobeVisualization = React.memo(() => {
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
            <StaticFlipWords
              words={["Domains", "Businesses", "You"]}
              className="inline-block"
            />
            {" "}Worldwide
          </h2>
          <p className="text-center text-sm md:text-lg text-white dark:text-white italic">
            Putting You on the Map of Search Engine Success.
          </p>
        </motion.div>

        {/* Static Globe Representation */}
        <div className="absolute w-full -bottom-20 h-72 md:h-full z-10 flex items-center justify-center">
          <div className="relative">
            {/* Main globe circle */}
            <div className="w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden shadow-2xl border border-blue-700">
              {/* Globe grid lines */}
              <div className="absolute inset-0">
                {/* Horizontal lines */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute left-0 right-0 border-t border-blue-400 opacity-30"
                    style={{ top: `${(i + 1) * 16.66}%` }}
                  />
                ))}
                {/* Vertical lines */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute top-0 bottom-0 border-l border-blue-400 opacity-30"
                    style={{ left: `${(i + 1) * 12.5}%` }}
                  />
                ))}
              </div>
              
              {/* Continents representation */}
              <div className="absolute top-1/4 left-1/3 w-16 h-12 bg-green-600 opacity-60 rounded-lg transform rotate-12" />
              <div className="absolute top-1/2 right-1/4 w-12 h-8 bg-green-600 opacity-60 rounded-md transform -rotate-6" />
              <div className="absolute bottom-1/3 left-1/4 w-20 h-10 bg-green-600 opacity-60 rounded-xl transform rotate-3" />
              
              {/* Connection points */}
              <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-1/2 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              
              {/* Connection arcs representation */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <path
                  d="M 30 40 Q 50 20 70 60"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="0.5"
                  fill="none"
                  className="animate-pulse"
                />
                <path
                  d="M 20 70 Q 60 50 80 30"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="0.5"
                  fill="none"
                  className="animate-pulse"
                  style={{ animationDelay: '1s' }}
                />
              </svg>
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 w-64 h-64 md:w-96 md:h-96 rounded-full bg-blue-500 opacity-20 blur-xl animate-pulse" />
            
            {/* Orbiting elements */}
            <div className="absolute top-1/2 left-1/2 w-80 h-80 md:w-[28rem] md:h-[28rem] -translate-x-1/2 -translate-y-1/2">
              <div className="relative w-full h-full animate-spin" style={{ animationDuration: '20s' }}>
                <div className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2" />
                <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2" />
                <div className="absolute top-1/2 left-0 w-1 h-1 bg-white rounded-full -translate-y-1/2" />
                <div className="absolute top-1/2 right-0 w-1 h-1 bg-white rounded-full -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

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
            className="w-full bg-red-400"
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

// Enhanced globe visualization component with WebGL detection
const GlobeVisualization = React.memo(() => {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [webglInfo, setWebglInfo] = useState<any>(null);

  useEffect(() => {
    // Add small delay to prevent flashing
    const timer = setTimeout(() => {
      const info = detectWebGL();
      setWebglInfo(info);
      setWebglSupported(info.supported && info.performanceLevel !== 'low');
      
      // Log WebGL info for debugging
      console.log('WebGL Detection Result:', info);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state briefly
  if (webglSupported === null) {
    return (
      <div className="flex flex-row items-center justify-center py-20 h-screen md:h-auto relative w-full z-20">
        <div className="max-w-7xl mx-auto w-full relative overflow-hidden h-full md:h-[40rem] px-4 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p></p>
          </div>
        </div>
      </div>
    );
  }

  // Use static version if WebGL is not supported or performance is too low
  if (!webglSupported) {
    console.log('Using static globe visualization due to WebGL limitations:', webglInfo?.reason);
    return <StaticGlobeVisualization />;
  }

  // Original WebGL-powered globe
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
          <Suspense 
            fallback={
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                 
                </div>
              </div>
            }
          >
            <World data={sampleArcs} globeConfig={globeConfig} />
          </Suspense>
        </div>
      </div>
    </div>
  );
});

// Error Boundary for WebGL errors
class WebGLErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('WebGL Error caught by boundary:', error, errorInfo);
  }

  render() {
    if ((this.state as any).hasError) {
      console.log('WebGL error boundary triggered, using static visualization');
      return <StaticGlobeVisualization />;
    }

    return (this.props as any).children;
  }
}

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useRecoilState(authAtom);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  useEffect(() => {
    // Detect WebGL support for background elements
    const timer = setTimeout(() => {
      const info = detectWebGL();
      setWebglSupported(info.supported && info.performanceLevel !== 'low');
      console.log('Background WebGL Detection:', info);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

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
        {/* Conditional rendering based on WebGL support */}
        {webglSupported === null ? (
          // Loading state
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : webglSupported ? (
          // WebGL supported - use original animated components
          <>
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
          </>
        ) : (
          // WebGL not supported - use static alternatives
          <>
            <StaticStarsBackground />
            <StaticShootingStars />
          </>
        )}

        {/* Globe visualization with error boundary */}
        <WebGLErrorBoundary>
          <GlobeVisualization />
        </WebGLErrorBoundary>
      </div>
    </div>
  );
};

export default LoginPage;