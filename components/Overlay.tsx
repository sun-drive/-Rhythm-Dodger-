import React from 'react';
import { GameState } from '../types';

interface OverlayProps {
  gameState: GameState;
  score: number;
  highScore: number;
  onRestart: () => void;
  onChangeStage: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ gameState, score, highScore, onRestart, onChangeStage }) => {
  if (gameState !== GameState.GameOver) {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-center p-8 backdrop-blur-sm z-10">
      <h2 className="text-5xl font-bold text-red-500 mb-4">게임 오버</h2>
      <div className="text-2xl text-white mb-6">
        <p>최종 점수: {score}</p>
        <p className="text-lg text-gray-400 mt-2">최고 점수: {highScore}</p>
      </div>
      <button
        onClick={onRestart}
        className="px-8 py-4 bg-cyan-500 text-gray-900 font-bold text-xl rounded-lg shadow-lg shadow-cyan-500/50 hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 mb-4"
      >
        다시 시작 (W,A,S,D)
      </button>
      <button
        onClick={onChangeStage}
        className="px-6 py-3 bg-gray-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-gray-500 transition-all duration-300 transform hover:scale-105"
      >
        스테이지 변경
      </button>
    </div>
  );
};

export default Overlay;