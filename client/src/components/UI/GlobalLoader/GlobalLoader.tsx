import React from 'react';

const JellyLoader: React.FC<{
  size?: number;
  color?: string;
  speed?: number;
}> = ({ 
  size = 40,
  color = 'black',
  speed = 0.9
}) => {
  return (
    <div className="relative">
      <style>{`
        @keyframes rotate {
          0%, 49.999%, 100% { transform: none; }
          50%, 99.999% { transform: rotate(90deg); }
        }
        @keyframes shiftLeft {
          0%, 100% { transform: translateX(0%); }
          50% { transform: scale(0.65) translateX(-75%); }
        }
        @keyframes shiftRight {
          0%, 100% { transform: translateX(0%); }
          50% { transform: scale(0.65) translateX(75%); }
        }
        
        .jelly-loader {
          position: relative;
          height: ${size / 2}px;
          width: ${size}px;
          filter: url(#uib-jelly-ooze);
          animation: rotate ${speed * 2}s linear infinite;
          will-change: transform;
        }
        
        .jelly-loader::before,
        .jelly-loader::after {
          content: '';
          position: absolute;
          top: 0%;
          left: 25%;
          width: 50%;
          height: 100%;
          background-color: ${color};
          border-radius: 9999px;
          will-change: transform;
          transition: background-color 0.3s ease;
        }
        
        .jelly-loader::before {
          animation: shiftLeft ${speed}s ease infinite;
        }
        
        .jelly-loader::after {
          animation: shiftRight ${speed}s ease infinite;
        }
      `}</style>
      
      <svg width="0" height="0" className="absolute w-0 h-0">
        <defs>
          <filter id="uib-jelly-ooze">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="5"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="ooze"
            />
            <feBlend in="SourceGraphic" in2="ooze" />
          </filter>
        </defs>
      </svg>

      <div className="jelly-loader" />
    </div>
  );
};

export default JellyLoader;