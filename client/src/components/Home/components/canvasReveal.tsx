import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const CanvasRevealEffect = ({ animationSpeed, containerClassName, colors, dotSize }: { animationSpeed: number; containerClassName: string; colors: number[][]; dotSize: number }) => {
  return (
    <div className={`absolute inset-0 ${containerClassName}`}> {/* Placeholder for animation */}</div>
  );
};

const Card = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="border border-gray-300 bg-brand text-white rounded-xl p-6 relative h-80 w-64 flex flex-col items-center justify-center shadow-lg"
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative z-10 text-center">
        <div className="mb-2">{icon}</div>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
    </div>
  );
};

const CanvasRevealEffectDemo = () => {
  return (
    <div className="py-20 flex flex-wrap gap-8 justify-center bg-brand text-white px-8">
      <Card
        title="I'm static and I know it."
        icon={<AceternityIcon />}
      >
        <CanvasRevealEffect
          animationSpeed={3}
          containerClassName="bg-black"
          colors={[[236, 72, 153], [232, 121, 249]]}
          dotSize={2}
        />
      </Card>
    </div>
  );
};

const AceternityIcon = () => {
  return (
    <svg
      width="66"
      height="65"
      viewBox="0 0 66 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10 text-white"
    >
      <path
        d="M8 8.05571C8 8.05571 54.9009 18.1782 57.8687 30.062C60.8365 41.9458 9.05432 57.4696 9.05432 57.4696"
        stroke="currentColor"
        strokeWidth="15"
        strokeMiterlimit="3.86874"
        strokeLinecap="round"
        style={{ mixBlendMode: "darken" }}
      />
    </svg>
  );
};

export default CanvasRevealEffectDemo;
