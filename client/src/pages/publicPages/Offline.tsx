import { motion } from 'framer-motion';

function Offline() {
  const cloudVariants = {
    animate: {
      y: [0, -10, 0], // Move cloud up and down
      opacity: [0.8, 1, 0.8], // Subtle opacity change
      transition: {
        y: {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        },
        opacity: {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
  };

  // Animation variants for text elements
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.3, duration: 0.6 },
    }),
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-5 relative overflow-hidden">
      {/* Animated Cloud */}
      <motion.svg
        className="w-48 h-48 mb-8"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        variants={cloudVariants}
        animate="animate"
        initial={{ y: 0, opacity: 0.8 }}
        style={{ originX: '50%', originY: '50%' }}
      >
        {/* Cloud background */}
        <motion.path
          fill="#FFFFFF"
          stroke="#E6E6E6"
          strokeWidth="8"
          d="M409.6,256c0-56.32-46.08-102.4-102.4-102.4c-14.08,0-26.88,3.84-39.68,8.96
          C246.16,126.08,209.28,102.4,166.4,102.4C94.72,102.4,38.4,158.72,38.4,230.4c0,3.84,0,7.68,0.64,11.52
          C15.04,260.48,0,289.92,0,320c0,53.12,43.52,96.64,96.64,96.64h289.92c69.12,0,125.44-56.32,125.44-125.44
          C512,238.08,465.92,256,409.6,256z"
        />
        {/* Wifi icon with slash (indicating offline) */}
        <motion.path
          fill="#9CA3AF"
          d="M256,307.2c-14.08,0-26.88,5.76-35.84,15.36l35.84,35.84l35.84-35.84
          C282.88,312.96,270.08,307.2,256,307.2z"
        />
        <motion.path
          fill="#9CA3AF" 
          d="M256,256c-28.16,0-53.12,11.52-71.68,30.08l17.92,17.92
          c14.08-14.08,32.64-23.04,53.76-23.04s39.68,8.96,53.76,23.04l17.92-17.92
          C309.12,267.52,284.16,256,256,256z"
        />
        <motion.path
          fill="#9CA3AF"
          d="M256,204.8c-42.24,0-80.64,17.28-108.16,44.8l17.92,17.92
          c23.04-23.04,53.76-35.84,90.24-35.84s67.2,12.8,90.24,35.84l17.92-17.92
          C336.64,222.08,298.24,204.8,256,204.8z"
        />
        {/* Red slash */}
        <motion.line
          x1="153.6"
          y1="153.6"
          x2="358.4"
          y2="358.4"
          stroke="#DC2626"
          strokeWidth="12"
          strokeLinecap="round"
        />
      </motion.svg>

      {/* Text Content */}
      <div className="text-center">
        <motion.h1
          className="text-6xl font-bold text-gray-800 mb-4"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={textVariants}
        >
          Offline
        </motion.h1>
        <motion.p
          className="text-xl text-gray-600 mb-8"
          initial="hidden"
          animate="visible"
          custom={1}
          variants={textVariants}
        >
          Oops! It seems you're not connected to the internet.
          <br />
          Please check your connection and try again.
        </motion.p>
        <motion.div
          initial="hidden"
          animate="visible"
          custom={2}
          variants={textVariants}
        >
          <button
            onClick={() => window.location.reload()}
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-full text-lg font-medium shadow-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>

      {/* Additional Info */}
      <motion.div
        className="mt-8 text-center"
        initial="hidden"
        animate="visible"
        custom={3}
        variants={textVariants}
      >
        <p className="text-gray-500">
          Your work will be available once you're back online.
          <br />
          We'll automatically reconnect when your connection is restored.
        </p>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="absolute bottom-5 text-gray-500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <p>&copy; {new Date().getFullYear()} EMIAC Technologies . All rights reserved.</p>
      </motion.div>
    </div>
  );
}

export default Offline;