import React from 'react';
import { Player as PlayerType, Obstacle as ObstacleType, Position, ReefWarning as ReefWarningType, Stage } from '../types';
import Player from './Player';
import Obstacle from './Obstacle';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import PlayerTrail from './PlayerTrail';
import ReefWarning from './ReefWarning';
import BeachBackground from './BeachBackground';

interface GameScreenProps {
  player: PlayerType;
  obstacles: ObstacleType[];
  playerTrail: Position[];
  hint: string | null;
  isInvincible: boolean;
  reefWarnings: ReefWarningType[];
  stage: Stage | null;
}

const GameScreen: React.FC<GameScreenProps> = ({ player, obstacles, playerTrail, hint, isInvincible, reefWarnings, stage }) => {
  const containerClasses = `relative border-2 border-cyan-400 overflow-hidden ${
    stage === Stage.Beach ? 'bg-transparent' : 'bg-gray-800'
  }`;
  
  return (
    <div
      className={containerClasses}
      style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
    >
      {stage === Stage.Beach && <BeachBackground />}
      {hint && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-20 bg-black bg-opacity-70 p-4 rounded-lg text-white text-xl font-bold animate-pulse">
              {hint}
          </div>
      )}
      {reefWarnings.map((warning) => (
        <ReefWarning key={warning.id} warning={warning} />
      ))}
      {playerTrail.map((pos, index) => (
        <PlayerTrail key={index} pos={pos} index={index} trailLength={playerTrail.length} />
      ))}
      <Player player={player} isInvincible={isInvincible} />
      {obstacles.map((obstacle) => (
        <Obstacle key={obstacle.id} obstacle={obstacle} />
      ))}
    </div>
  );
};

export default GameScreen;