import React from 'react';
import { Obstacle as ObstacleType, ObstacleType as ObsTypeEnum } from '../types';

interface ObstacleProps {
  obstacle: ObstacleType;
}

const Obstacle: React.FC<ObstacleProps> = ({ obstacle }) => {
  let colorClasses = "";
  let shapeClasses = "";
  let styles: React.CSSProperties = {
    left: obstacle.pos.x,
    top: obstacle.pos.y,
    width: obstacle.width,
    height: obstacle.height,
  };

  switch (obstacle.type) {
    // Classic
    case ObsTypeEnum.Dodge:
      colorClasses = "bg-red-500 border-t-2 border-red-300";
      break;
    case ObsTypeEnum.Still:
      colorClasses = "bg-green-500 border-t-2 border-green-300";
      break;
    case ObsTypeEnum.Move:
      colorClasses = "bg-purple-500 border-t-2 border-purple-300";
      break;
    case ObsTypeEnum.Push:
      colorClasses = "bg-blue-500 border-t-2 border-blue-300";
      break;
    // Shared
    case ObsTypeEnum.Heal:
      colorClasses = "bg-white border-t-2 border-gray-200 shadow-lg shadow-white/50";
      break;
    // Beach
    case ObsTypeEnum.Wave:
      colorClasses = "bg-sky-400 border-t-2 border-sky-200 opacity-80";
      break;
    case ObsTypeEnum.Reef:
      colorClasses = "bg-gray-600 border-2 border-gray-500";
      shapeClasses = "rounded-md reef-fade"; // Apply fade-out animation
      break;
    case ObsTypeEnum.Fish:
      colorClasses = "bg-teal-400";
      shapeClasses = "rounded-full";
      break;
  }

  return (
    <div
      className={`absolute ${colorClasses} ${shapeClasses}`}
      style={styles}
    />
  );
};

export default Obstacle;