
import React from 'react';
import { Player as PlayerType } from '../types';

interface PlayerProps {
  player: PlayerType;
  isInvincible: boolean;
}

const Player: React.FC<PlayerProps> = ({ player, isInvincible }) => {
  const playerClasses = `absolute bg-cyan-400 rounded-sm shadow-lg shadow-cyan-500/50 ${isInvincible ? 'blinking' : ''}`;

  return (
    <div
      className={playerClasses}
      style={{
        left: player.pos.x,
        top: player.pos.y,
        width: player.size,
        height: player.size,
      }}
    />
  );
};

export default Player;