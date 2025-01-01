import React, { useState, useEffect, useRef } from "react";

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
    <section ref={sectionRef} className="relative">
      {/* Concave Arc Background */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-brand-light to-brand-dark transform -translate-y-[50%] z-[-1] rounded-b-full"></div>

      <div className="container mx-auto text-center py-16 px-6">
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">
          We’re in the business of growing businesses.
        </h2>

        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center"
            >
              {/* Animated Stat */}
              <div className="flex items-baseline justify-center space-x-2">
                <h3 className="text-6xl font-bold text-brand-primary">
                  {hasAnimated ? <Counter endValue={metric.stat} /> : 0}
                </h3>
                {metric.id !== 2 && (
                  <span className="text-3xl text-brand-primary font-bold">
                    %
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 text-center mt-4">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
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
