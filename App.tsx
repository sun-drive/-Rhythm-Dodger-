
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Player, Obstacle, Position, ObstacleType, Stage, ReefWarning } from './types';
import * as C from './constants';
import { GameScreen, Overlay, StageSelectScreen } from './components';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.StageSelect);
  const [stage, setStage] = useState<Stage | null>(null);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState(() => {
    const classic = Number(localStorage.getItem('rhythmDodgerHighScore_classic')) || 0;
    const beach = Number(localStorage.getItem('rhythmDodgerHighScore_beach')) || 0;
    return { classic, beach };
  });
  const [hint, setHint] = useState<string | null>(null);
  const [lives, setLives] = useState<number>(C.INITIAL_LIVES);
  const [isInvincible, setIsInvincible] = useState<boolean>(false);
  const [invincibilityTimer, setInvincibilityTimer] = useState<number | null>(null);

  const [player, setPlayer] = useState<Player>({
    pos: { x: C.GAME_WIDTH / 2 - C.PLAYER_SIZE / 2, y: C.GAME_HEIGHT - C.PLAYER_SIZE - 20 },
    size: C.PLAYER_SIZE,
  });
  const [playerTrail, setPlayerTrail] = useState<Position[]>([]);

  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [reefWarnings, setReefWarnings] = useState<ReefWarning[]>([]);
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({});
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const gameLoopRef = useRef<number | null>(null);
  const gameFrameRef = useRef<number>(0);
  const obstacleSpeedRef = useRef<number>(C.INITIAL_OBSTACLE_SPEED);
  const spawnRateRef = useRef<number>(C.INITIAL_SPAWN_RATE);
  const nextItemId = useRef<number>(0);
  const hintTimeoutRef = useRef<number | null>(null);

  // PWA Installation Effect
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const resetGame = useCallback(() => {
    setPlayer({
      pos: { x: C.GAME_WIDTH / 2 - C.PLAYER_SIZE / 2, y: C.GAME_HEIGHT - C.PLAYER_SIZE - 20 },
      size: C.PLAYER_SIZE,
    });
    setObstacles([]);
    setReefWarnings([]);
    setPlayerTrail([]);
    setScore(0);
    setLives(C.INITIAL_LIVES);
    setIsInvincible(false);
    if (invincibilityTimer) clearTimeout(invincibilityTimer);
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    setHint(null);
    gameFrameRef.current = 0;
    obstacleSpeedRef.current = C.INITIAL_OBSTACLE_SPEED;
    spawnRateRef.current = C.INITIAL_SPAWN_RATE;
  }, [invincibilityTimer]);

  const changeStage = useCallback(() => {
    setGameState(GameState.StageSelect);
    setStage(null);
  }, []);

  const startGame = useCallback((selectedStage: Stage) => {
    resetGame();
    setStage(selectedStage);
    setGameState(GameState.Playing);
  }, [resetGame]);

  const triggerInvincibility = useCallback(() => {
      if (invincibilityTimer) clearTimeout(invincibilityTimer);
      setIsInvincible(true);
      const timer = window.setTimeout(() => setIsInvincible(false), C.INVINCIBILITY_DURATION);
      setInvincibilityTimer(timer);
  }, [invincibilityTimer]);

  const handlePlayerHit = useCallback(() => {
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives > 0) {
          triggerInvincibility();
      } else {
          setGameState(GameState.GameOver);
          if (stage) {
            const currentHighScore = highScores[stage];
            if (score > currentHighScore) {
              const newHighScores = { ...highScores, [stage]: score };
              setHighScores(newHighScores);
              localStorage.setItem(`rhythmDodgerHighScore_${stage}`, String(score));
            }
          }
      }
  }, [lives, score, highScores, stage, triggerInvincibility]);

  // --- Game Loop ---
  const gameLoop = useCallback(() => {
    if (gameState !== GameState.Playing || !stage) return;
    const now = Date.now();
    gameFrameRef.current++;

    // 1. Update Player Position
    let newPlayerPos = { ...player.pos };
    const isMoving = keysPressed['w'] || keysPressed['a'] || keysPressed['s'] || keysPressed['d'];
    if (keysPressed['w']) newPlayerPos.y -= C.PLAYER_SPEED;
    if (keysPressed['s']) newPlayerPos.y += C.PLAYER_SPEED;
    if (keysPressed['a']) newPlayerPos.x -= C.PLAYER_SPEED;
    if (keysPressed['d']) newPlayerPos.x += C.PLAYER_SPEED;
    newPlayerPos.x = Math.max(0, Math.min(C.GAME_WIDTH - player.size, newPlayerPos.x));
    newPlayerPos.y = Math.max(0, Math.min(C.GAME_HEIGHT - player.size, newPlayerPos.y));
    
    // 2. Process Obstacles & Spawns
    let updatedObstacles = obstacles
      .map((o) => ({ ...o, pos: { ...o.pos, y: o.pos.y + obstacleSpeedRef.current * (o.speedMultiplier || 1) } }))
      .filter((o) => {
        // Filter out expired reefs
        if (o.type === ObstacleType.Reef && o.createdAt && now - o.createdAt > C.REEF_LIFESPAN) {
            return false;
        }
        // Filter out off-screen obstacles
        return o.pos.y < C.GAME_HEIGHT && o.pos.y > -C.OBSTACLE_HEIGHT * 5;
      });
    
    // --- Spawning Logic by Stage ---
    if (stage === Stage.Classic) {
        if (gameFrameRef.current % Math.round(spawnRateRef.current) === 0) {
            const safeLanes = new Set<number>();
            while (safeLanes.size < 2) safeLanes.add(Math.floor(Math.random() * C.NUM_LANES));
            
            for (let i = 0; i < C.NUM_LANES; i++) {
                if (safeLanes.has(i)) continue;
                let type = ObstacleType.Dodge;
                const rand = Math.random();
                if (score > C.PUSH_BLOCK_SCORE_THRESHOLD && rand < 0.20) type = ObstacleType.Push;
                else if (score > C.MOVE_BLOCK_SCORE_THRESHOLD && rand < 0.30) type = ObstacleType.Move;
                else if (score > C.STILL_BLOCK_SCORE_THRESHOLD && rand < 0.35) type = ObstacleType.Still;
                updatedObstacles.push({ id: nextItemId.current++, pos: { x: i * C.LANE_WIDTH, y: -C.OBSTACLE_HEIGHT }, width: C.LANE_WIDTH, height: C.OBSTACLE_HEIGHT, type });
            }
        }
    } else if (stage === Stage.Beach) {
        // Regular Dodge block spawn
        if (gameFrameRef.current % Math.round(spawnRateRef.current) === 0) {
            const lane = Math.floor(Math.random() * C.NUM_LANES);
            updatedObstacles.push({id: nextItemId.current++, pos: {x: lane * C.LANE_WIDTH, y: -C.OBSTACLE_HEIGHT }, width: C.LANE_WIDTH, height: C.OBSTACLE_HEIGHT, type: ObstacleType.Dodge });
        }
        // Wave spawn
        if (score > C.WAVE_SCORE_THRESHOLD && gameFrameRef.current % Math.round(spawnRateRef.current * 1.5) === 10) {
            const widthLanes = Math.random() < 0.6 ? 1 : 2;
            const startLane = Math.floor(Math.random() * (C.NUM_LANES - widthLanes + 1));
            updatedObstacles.push({ id: nextItemId.current++, pos: { x: startLane * C.LANE_WIDTH, y: -C.OBSTACLE_HEIGHT }, width: widthLanes * C.LANE_WIDTH, height: C.OBSTACLE_HEIGHT, type: ObstacleType.Wave, speedMultiplier: C.WAVE_SPEED_MULTIPLIER });
        }
        // Reef spawn
        if (score > C.REEF_SCORE_THRESHOLD && gameFrameRef.current % C.REEF_SPAWN_RATE_FRAMES === 0) {
            setReefWarnings(prev => [...prev, { id: nextItemId.current++, pos: { x: Math.random() * (C.GAME_WIDTH - C.REEF_SIZE), y: Math.random() * (C.GAME_HEIGHT - C.REEF_SIZE) }, size: C.REEF_SIZE, createdAt: now }]);
        }
        // Fish spawn
        if (score > C.FISH_SCORE_THRESHOLD && gameFrameRef.current % C.FISH_SPAWN_RATE_FRAMES === 0) {
            updatedObstacles.push({ id: nextItemId.current++, pos: { x: Math.floor(Math.random() * (C.GAME_WIDTH - C.FISH_SIZE)), y: -C.FISH_SIZE }, width: C.FISH_SIZE, height: C.FISH_SIZE, type: ObstacleType.Fish });
        }
    }

    // Spawn heal block if score threshold is crossed
    const prevScore = score;
    const currentScore = score + (gameState === GameState.Playing ? 1 : 0);
    if (Math.floor(prevScore / C.HEAL_BLOCK_SCORE_INTERVAL) < Math.floor(currentScore / C.HEAL_BLOCK_SCORE_INTERVAL)) {
        const randomLane = Math.floor(Math.random() * C.NUM_LANES);
        updatedObstacles.push({ id: nextItemId.current++, pos: { x: randomLane * C.LANE_WIDTH, y: -C.OBSTACLE_HEIGHT }, width: C.LANE_WIDTH, height: C.OBSTACLE_HEIGHT, type: ObstacleType.Heal });
    }
    
    // Process Reef Warnings
    const newReefs: Obstacle[] = [];
    const remainingWarnings = reefWarnings.filter(w => {
      if (now - w.createdAt > C.REEF_WARNING_DURATION) {
        newReefs.push({ id: w.id, pos: w.pos, width: w.size, height: w.size, type: ObstacleType.Reef, speedMultiplier: 0, createdAt: now });
        return false;
      }
      return true;
    });
    if (newReefs.length > 0) updatedObstacles.push(...newReefs);

    // 3. Collision Detection and Handling
    let playerWasHit = false;
    for (let i = updatedObstacles.length - 1; i >= 0; i--) {
      const obs = updatedObstacles[i];
      const playerRect = { x: newPlayerPos.x, y: newPlayerPos.y, w: player.size, h: player.size };
      const obsRect = { x: obs.pos.x, y: obs.pos.y, w: obs.width, h: obs.height };
      
      const isCircular = obs.type === ObstacleType.Fish;
      let collided = false;
      if (isCircular) {
        const circle = { x: obs.pos.x + obs.width / 2, y: obs.pos.y + obs.height / 2, r: obs.width / 2 };
        const closestX = Math.max(playerRect.x, Math.min(circle.x, playerRect.x + playerRect.w));
        const closestY = Math.max(playerRect.y, Math.min(circle.y, playerRect.y + playerRect.h));
        const distance = Math.sqrt((circle.x - closestX)**2 + (circle.y - closestY)**2);
        if (distance < circle.r) collided = true;
      } else {
        if (playerRect.x < obsRect.x + obsRect.w && playerRect.x + playerRect.w > obsRect.x && playerRect.y < obsRect.y + obsRect.h && playerRect.y + playerRect.h > obsRect.y) {
          collided = true;
        }
      }

      if (collided) {
        if (obs.type === ObstacleType.Heal) { // Heal works anytime
          setLives(prev => Math.min(C.INITIAL_LIVES, prev + C.HEAL_AMOUNT));
          updatedObstacles.splice(i, 1);
          continue;
        }
        if (stage === Stage.Classic && obs.type === ObstacleType.Push) { // Push works anytime
            newPlayerPos.y = Math.max(0, newPlayerPos.y - C.PUSH_AMOUNT);
            updatedObstacles.splice(i, 1);
            continue;
        }
        if (stage === Stage.Beach && obs.type === ObstacleType.Reef) { // Reef ignores invincibility
          playerWasHit = true;
          updatedObstacles.splice(i, 1); // Reef disappears after hit
          break;
        }
        if (isInvincible) {
            if (stage === Stage.Beach && obs.type === ObstacleType.Fish) {
              triggerInvincibility(); // Reset timer
              updatedObstacles.splice(i, 1);
            }
            continue; // Invincible to other damage types
        }
        // --- Standard Damage Cases (not invincible) ---
        let shouldTakeDamage = false;
        if (stage === Stage.Classic) {
            if (obs.type === ObstacleType.Dodge || (obs.type === ObstacleType.Still && isMoving) || (obs.type === ObstacleType.Move && !isMoving)) {
                shouldTakeDamage = true;
            }
        } else if (stage === Stage.Beach) {
            if ([ObstacleType.Dodge, ObstacleType.Wave, ObstacleType.Fish].includes(obs.type)) {
                shouldTakeDamage = true;
            }
        }
        if (shouldTakeDamage) {
            playerWasHit = true;
            break;
        }
      }
    }

    // 4. Update Game State
    const updatedPlayer = { ...player, pos: newPlayerPos };
    setPlayer(updatedPlayer);
    setObstacles(updatedObstacles);
    setReefWarnings(remainingWarnings);

    if (playerWasHit) {
      handlePlayerHit();
    } else {
      if (gameFrameRef.current % 2 === 0) setPlayerTrail(prev => [updatedPlayer.pos, ...prev].slice(0, 2));
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > C.SPEED_INCREASE_SCORE_THRESHOLD && (newScore - C.SPEED_INCREASE_SCORE_THRESHOLD) % C.SPEED_INCREASE_INTERVAL === 0) {
        obstacleSpeedRef.current += C.SPEED_INCREASE_AMOUNT;
      }
      if (newScore % C.SPAWN_RATE_DECREASE_INTERVAL === 0) {
        spawnRateRef.current = Math.max(C.MIN_SPAWN_RATE, spawnRateRef.current - C.SPAWN_RATE_DECREASE_AMOUNT);
      }
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, keysPressed, player, obstacles, score, isInvincible, handlePlayerHit, stage, reefWarnings, triggerInvincibility]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        if (['w', 'a', 's', 'd'].includes(key) && (gameState === GameState.GameOver)) {
            if (stage) startGame(stage);
        }
        setKeysPressed(prev => ({ ...prev, [key]: true }));
    };
    const handleKeyUp = (e: KeyboardEvent) => setKeysPressed(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, startGame, stage]);
  
  useEffect(() => {
    if (gameState === GameState.Playing) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameState, gameLoop]);

  const currentHighScore = stage ? highScores[stage] : 0;

  if (gameState === GameState.StageSelect) {
    return (
      <StageSelectScreen 
        onStageSelect={startGame} 
        highScores={highScores} 
        onInstall={deferredPrompt ? handleInstallClick : undefined}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-mono p-4">
        <div className="text-center mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 tracking-widest">
              {stage === Stage.Classic ? '클래식 모드' : '해변 스테이지'}
            </h1>
        </div>
        <div className="relative shadow-2xl shadow-cyan-500/20" style={{ width: C.GAME_WIDTH, height: C.GAME_HEIGHT }}>
            <GameScreen stage={stage} player={player} obstacles={obstacles} playerTrail={playerTrail} hint={hint} isInvincible={isInvincible} reefWarnings={reefWarnings} />
            <Overlay gameState={gameState} score={score} highScore={currentHighScore} onRestart={() => stage && startGame(stage)} onChangeStage={changeStage} />
        </div>
        <div className="grid grid-cols-3 w-full max-w-sm mt-4 text-xl">
            <div className="text-left">
                <p className="text-gray-400">점수</p>
                <p className="text-white font-bold">{score}</p>
            </div>
            <div className="text-center">
                <p className="text-gray-400">생명</p>
                <p className="text-white font-bold text-2xl tracking-wider">
                  {Array(lives > 0 ? lives : 0).fill('❤️').join(' ')}
                </p>
            </div>
            <div className="text-right">
                <p className="text-gray-400">최고 점수</p>
                <p className="text-white font-bold">{currentHighScore}</p>
            </div>
        </div>
    </div>
  );
};

export default App;
