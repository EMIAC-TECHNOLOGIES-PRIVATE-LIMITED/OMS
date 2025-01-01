import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const features = [
  {
    title: "Collaboration",
    subtitle: "Communicate in countless ways from one place.",
    description:
      "Slack is built for bringing people and information together. Type things out. Talk things through. Invite external organisations into the conversation.",
    stat: "80%",
    statDescription:
      "of the Fortune 100 use Slack Connect to work with partners and customers.",
    imageSrc: "/features/collaboration.png",
    color: "#017A3C",
  },
  {
    title: "Project Management",
    subtitle: "Manage projects and move work forwards faster.",
    description:
      "Prioritise tasks, share ideas and stay aligned. Slack brings every piece of your project together from start to finish.",
    stat: "47%",
    statDescription: "increase in productivity for teams using Slack.",
    imageSrc: "/features/project-management.png",
    color: "#FCC003",
  },
  {
    title: "Integrations",
    subtitle: "Tap into the tools that you already use.",
    description:
      "Over 2,600 apps are ready to connect in Slack, so you can automate everyday tasks in the flow of work and save your team precious time.",
    stat: "35%",
    statDescription: "increase in time saved due to automation for Slack users.",
    imageSrc: "/features/integrations.png",
    color: "#1AB9FF",
  },
];

const FeaturesSection = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [hasReachedSticky, setHasReachedSticky] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const sectionRect = section.getBoundingClientRect();
      const sectionTop = window.scrollY + sectionRect.top;
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Adjust the sticky trigger point to activate earlier (e.g., 40% instead of 25%)
      const stickyTriggerPoint = sectionTop - viewportHeight * 0.6;
      setHasReachedSticky(scrollPosition > stickyTriggerPoint);

      // Calculate progress for feature switching
      const scrollableArea = sectionRect.height - viewportHeight;
      const progress = (scrollPosition - sectionTop) / scrollableArea;
      setScrollProgress(Math.max(0, Math.min(1, progress)));

      // Calculate current feature index
      const normalizedProgress = Math.max(0, Math.min(1, progress));
      const featureIndex = Math.min(
        features.length - 1,
        Math.floor(normalizedProgress * features.length)
      );
      setCurrentFeatureIndex(featureIndex);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentFeature = features[currentFeatureIndex];

  // Adjust the initial Y position to ensure smooth transition
  const imageEntryY = hasReachedSticky ? 0 : 100;

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-b from-gray-50 to-white py-40"
    >
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row relative">
          {/* Text Section */}
          <div className="w-full lg:w-1/2 space-y-[100vh] first:pt-[50vh]">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="h-screen flex items-center px-6 lg:px-12"
              >
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: currentFeatureIndex === index ? 1 : 0.3,
                    y: currentFeatureIndex === index ? 0 : 20,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <h2
                    className="text-5xl lg:text-6xl font-bold"
                    style={{ color: feature.color }}
                  >
                    {feature.title}
                  </h2>
                  <h3 className="text-2xl lg:text-3xl text-gray-700 font-semibold">
                    {feature.subtitle}
                  </h3>
                  <p className="text-lg text-gray-600">{feature.description}</p>
                  <div className="mt-6">
                    <span
                      className="text-4xl font-bold"
                      style={{ color: feature.color }}
                    >
                      {feature.stat}
                    </span>
                    <p className="text-gray-500 text-lg">
                      {feature.statDescription}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Image Section */}
          <motion.div
            className={`w-full lg:w-1/2 ${
              hasReachedSticky
                ? "lg:fixed lg:top-[40%] lg:right-0 lg:w-1/2 lg:-translate-y-[40%]"
                : "relative"
            }`}
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: hasReachedSticky ? 1 : 0,
              y: imageEntryY,
            }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative w-[540px] h-[540px] mx-auto">
              {/* Background Shape */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: currentFeature.color }}
                animate={{ backgroundColor: currentFeature.color }}
                transition={{ duration: 0.5 }}
              />

              {/* Feature Image */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentFeature.imageSrc}
                  src={currentFeature.imageSrc}
                  alt={currentFeature.title}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-lg z-10"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                />
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
