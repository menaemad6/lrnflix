import React from "react";

interface SparkLoaderProps {
  text?: string;
  color?: string;
  size?: number;
  textClassName?: string;
  className?: string;
}

/**
 * Modern animated loader: a glowing ball bounces, then travels right, with animated text opacity.
 * Props:
 * - text: Loader message (default: "It all starts with a spark")
 * - color: Ball/glow color (default: theme accent)
 * - size: Height of loader in px (default: 48)
 * - textClassName: Extra classes for text
 * - className: Extra classes for wrapper
 */
export const SparkLoader: React.FC<SparkLoaderProps> = ({
  text = "It all starts with a spark",
  color = "white", // secondary accent, can be replaced with theme color
  size = 48,
  textClassName = "",
  className = "",
}) => {
  return (
    <div
      className={`flex items-center gap-6 ${className}`}
      style={{ minHeight: size, minWidth: 220 }}
    >
      <div
        className="relative"
        style={{ width: size / 2, height: size }}
      >
        {/* Glowing ball */}
        <span
          className="absolute left-1/2"
          style={{
            top: `calc(50% - 30px)`,
            transform: 'translate(-50%, 0)',
            width: size / 6,
            height: size / 6,
            background: color,
            borderRadius: "50%",
            boxShadow: `0 0 ${size / 2}px ${color}66, 0 0 ${size / 4}px ${color}99`,
            animation: "spark-bounce-updown 1.2s cubic-bezier(.7,0,.3,1) infinite"
          }}
        />
      </div>
      <span
        className={`text-lg font-medium tracking-wide ${textClassName}`}
        style={{
          color: color,
          animation: "spark-text-fade 1.2s cubic-bezier(.7,0,.3,1) infinite"
        }}
      >
        {text}
      </span>
      <style>{`
        @keyframes spark-bounce-updown {
          0% { transform: translate(-50%, 30px); }
          15% { transform: translate(-50%, -30px); }
          30% { transform: translate(-50%, 30px); }
          45% { transform: translate(-50%, -15px); }
          60% { transform: translate(-50%, 30px); }
          100% { transform: translate(-50%, 30px); }
        }
        @keyframes spark-text-fade {
          0% { opacity: 0.5; }
          10% { opacity: 1; }
          60% { opacity: 1; }
          80% { opacity: 0.7; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default SparkLoader; 