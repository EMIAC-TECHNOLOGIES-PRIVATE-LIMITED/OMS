import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const metrics = [
  {
    id: 1,
    stat: 90,
    description: "of users say our platform helps them stay more connected.",
  },
  {
    id: 2,
    stat: 43,
    description: "average number of tools integrated by agencies.",
  },
  {
    id: 3,
    stat: 87,
    description: "of users report increased collaboration efficiency.",
  },
];

const PremiumStatsSection = () => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  const isInViewport = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return rect.top <= window.innerHeight && rect.bottom >= 0;
  };

  const handleScroll = () => {
    if (sectionRef.current && isInViewport(sectionRef.current)) {
      setHasAnimated(true);
      window.removeEventListener("scroll", handleScroll);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Animated SVG Section */}
      <motion.div
        className="w-full overflow-hidden"
        style={{ height: "200px" }}
        initial={{ opacity: 0, y: 50 }}
        animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <svg
          viewBox="0 0 1440 200"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,0 C480,200 960,200 1440,0 L1440,200 L0,200 Z"
            fill="#005a2d" // brand dark
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      <motion.section
        ref={sectionRef}
        className="relative bg-brand-dark py-24"
        initial={{ opacity: 0, y: 50 }}
        animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto text-center px-6">
          {/* Headline */}
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            We’re in the business of growing businesses.
          </motion.h2>

          {/* Cards Section */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-16"
            initial="hidden"
            animate={hasAnimated ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 },
              },
            }}
          >
            {metrics.map((metric) => (
              <motion.div
                key={metric.id}
                className="flex flex-col items-center space-y-6"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Animated Stat */}
                <div className="flex items-baseline justify-center space-x-1">
                  <h3 className="text-8xl font-extrabold text-brand-light">
                    {hasAnimated ? <Counter endValue={metric.stat} /> : 0}
                  </h3>
                  {metric.id !== 2 && (
                    <span className="text-5xl font-extrabold text-brand-light">
                      %
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-white text-xl font-semibold text-center">
                  {metric.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </>
  );
};

// Counter Component for Animated Stats
const Counter: React.FC<{ endValue: number }> = ({ endValue }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = endValue / 50;

    const updateCounter = () => {
      start += increment;
      if (start >= endValue) {
        setCount(endValue);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    };

    const timer = setInterval(updateCounter, 30);
    return () => clearInterval(timer);
  }, [endValue]);

  return <>{count}</>;
};

export default PremiumStatsSection;
