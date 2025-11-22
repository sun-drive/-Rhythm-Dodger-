
import React from 'react';
import { Stage } from '../types';

interface StageSelectScreenProps {
  onStageSelect: (stage: Stage) => void;
  highScores: { classic: number; beach: number };
  onInstall?: () => void;
}

const StageSelectScreen: React.FC<StageSelectScreenProps> = ({ onStageSelect, highScores, onInstall }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-mono p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 tracking-widest">스테이지 선택</h1>
        <p className="text-gray-400 mt-2">플레이할 모드를 선택하세요.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Classic Stage */}
        <div className="bg-gray-800 border-2 border-purple-500 rounded-lg p-8 flex flex-col items-center text-center shadow-lg shadow-purple-500/20">
          <h2 className="text-3xl font-bold text-purple-400 mb-4">클래식 모드</h2>
          <p className="text-gray-300 mb-6 h-24">
            오리지널 리듬 회피! <br />
            초록, 보라, 파랑 블록의 <br />
            다양한 기믹에 도전하세요.
          </p>
          <p className="text-lg text-gray-400 mb-4">최고 점수: <span className="font-bold text-white">{highScores.classic}</span></p>
          <button
            onClick={() => onStageSelect(Stage.Classic)}
            className="w-full px-8 py-4 bg-purple-500 text-white font-bold text-xl rounded-lg shadow-lg shadow-purple-500/50 hover:bg-purple-400 transition-all duration-300 transform hover:scale-105"
          >
            플레이
          </button>
        </div>
        
        {/* Beach Stage */}
        <div className="bg-gray-800 border-2 border-sky-500 rounded-lg p-8 flex flex-col items-center text-center shadow-lg shadow-sky-500/20">
          <h2 className="text-3xl font-bold text-sky-400 mb-4">해변 스테이지</h2>
          <p className="text-gray-300 mb-6 h-24">
            새로운 특수 블록 등장! <br />
            빠른 파도, 갑작스런 암초, <br />
            그리고 방해꾼 물고기를 피하세요.
          </p>
           <p className="text-lg text-gray-400 mb-4">최고 점수: <span className="font-bold text-white">{highScores.beach}</span></p>
          <button
            onClick={() => onStageSelect(Stage.Beach)}
            className="w-full px-8 py-4 bg-sky-500 text-white font-bold text-xl rounded-lg shadow-lg shadow-sky-500/50 hover:bg-sky-400 transition-all duration-300 transform hover:scale-105"
          >
            플레이
          </button>
        </div>
      </div>
      
      {onInstall && (
        <button
          onClick={onInstall}
          className="mt-12 px-6 py-3 bg-gray-700 text-gray-300 border border-gray-500 rounded-full hover:bg-gray-600 hover:text-white transition-colors flex items-center gap-2 animate-bounce"
        >
           <span>📥</span> 앱 설치하기
        </button>
      )}
    </div>
  );
};

export default StageSelectScreen;
