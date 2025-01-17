import React, { useEffect, useState } from 'react';

interface SpinnerProps {
  imagePath: string;
  size?: number; // Represents size in pixels
  rotationDuration?: number;
  pauseDuration?: number;
}

const Spinner: React.FC<SpinnerProps> = ({
  imagePath,
  size = 10, // Default size in pixels
  rotationDuration = 700,
  pauseDuration = 300
}) => {
  const [isRotating, setIsRotating] = useState<boolean>(true);

  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setIsRotating(false);

      setTimeout(() => {
        setIsRotating(true);
      }, pauseDuration);

    }, rotationDuration + pauseDuration);

    return () => clearInterval(rotationInterval);
  }, [rotationDuration, pauseDuration]);

  return (
    <div className="flex items-center justify-center">
      <img
        src={imagePath}
        alt="Loading..."
        className={`${isRotating ? 'animate-spin' : ''} transition-all`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          animationDuration: `${rotationDuration}ms`,
          animationTimingFunction: 'linear',
        }}
      />
    </div>
  );
};

export default Spinner;
