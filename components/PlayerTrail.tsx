import React from 'react';
import { Position } from '../types';
import { PLAYER_SIZE } from '../constants';

interface PlayerTrailProps {
  pos: Position;
  index: number;
  trailLength: number;
}

const PlayerTrail: React.FC<PlayerTrailProps> = ({ pos, index, trailLength }) => {
  // Constant opacity for a "stamp" effect.
  const opacity = 0.4;

  return (
    <div
      className="absolute bg-cyan-400 rounded-sm"
      style={{
        left: pos.x,
        top: pos.y,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
        opacity: opacity,
        willChange: 'opacity', // performance hint
      }}
    />
  );
};

export default PlayerTrail;
