export enum GameState {
  StageSelect = 'stageSelect',
  Playing = 'playing',
  GameOver = 'gameOver',
}

export enum Stage {
  Classic = 'classic',
  Beach = 'beach',
}

export enum ObstacleType {
  // Classic
  Dodge = 'dodge', // Red block, must be avoided
  Still = 'still', // Green block, must be still to pass
  Move = 'move',   // Purple block, must be moving to pass
  Push = 'push',   // Blue block, pushes the player up
  
  // Shared
  Heal = 'heal',   // White block, restores lives

  // Beach
  Wave = 'wave',
  Reef = 'reef',
  Fish = 'fish',
}

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  pos: Position;
  size: number;
}

export interface Obstacle {
  id: number;
  pos: Position;
  width: number;
  height: number;
  type: ObstacleType;
  speedMultiplier?: number;
  createdAt?: number; // Added to track reef lifespan
}

export interface ReefWarning {
  id: number;
  pos: Position;
  size: number;
  createdAt: number;
}