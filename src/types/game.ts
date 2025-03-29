// src/types/game.ts
export interface GameScore {
  score: number;
  timestamp: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameGridState {
  gridSize: number;
  sequence: number[];
  userSequence: number[];
  isShowingPattern: boolean;
  currentRound: number;
}
