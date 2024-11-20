import React, { useEffect, useState } from 'react';

interface SpinnerProps {
  imagePath: string;
  size?: number;
  rotationDuration?: number;
  pauseDuration?: number;
}

const Spinner: React.FC<SpinnerProps> = ({
  imagePath,
  size = 10,
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
    <div className="flex items-center justify-center w-full h-full">
      <img
        src={imagePath}
        alt="Loading..."
        className={`
          w-20
          h-20
          object-contain
          ${isRotating ? 'animate-spin' : ''}
          transition-all
          duration-700
        `}
        style={{
          animationDuration: `${rotationDuration}ms`,
          animationTimingFunction: 'linear'
        }}
      />
    </div>
  );
};

export default Spinner;