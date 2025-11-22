export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 600;

export const PLAYER_SIZE = 30;
export const PLAYER_SPEED = 4;
export const INITIAL_LIVES = 3;
export const INVINCIBILITY_DURATION = 2000; // 2 seconds

export const OBSTACLE_HEIGHT = 20;
export const INITIAL_OBSTACLE_SPEED = 1.0;
export const NUM_LANES = 4;
export const LANE_WIDTH = GAME_WIDTH / NUM_LANES;

export const SPEED_INCREASE_SCORE_THRESHOLD = 8000;
export const SPEED_INCREASE_INTERVAL = 500;
export const SPEED_INCREASE_AMOUNT = 0.2;

export const INITIAL_SPAWN_RATE = 140;
export const SPAWN_RATE_DECREASE_INTERVAL = 1000;
export const SPAWN_RATE_DECREASE_AMOUNT = 2;
export const MIN_SPAWN_RATE = 20;

export const HEAL_BLOCK_SCORE_INTERVAL = 500;
export const HEAL_AMOUNT = 2;

// --- Classic Mode Constants ---
export const PUSH_BLOCK_SCORE_THRESHOLD = 10000;
export const PUSH_AMOUNT = PLAYER_SIZE * 2;
export const STILL_BLOCK_SCORE_THRESHOLD = 3000;
export const MOVE_BLOCK_SCORE_THRESHOLD = 7500;

// --- Beach Stage Constants ---
export const WAVE_SCORE_THRESHOLD = 3000;
export const WAVE_SPEED_MULTIPLIER = 2;

export const REEF_SCORE_THRESHOLD = 6000;
export const REEF_WARNING_DURATION = 1750; // ms
export const REEF_LIFESPAN = 6000; // 6 seconds in ms
export const REEF_SIZE = 40;
export const REEF_SPAWN_RATE_FRAMES = 180; // How often a reef can spawn

export const FISH_SCORE_THRESHOLD = 8500;
export const FISH_SIZE = 15;
export const FISH_SPAWN_RATE_FRAMES = 120; // How often a fish can spawn