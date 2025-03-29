// Define types
export type Difficulty = "Easy" | "Medium" | "Hard";
export type GameState = "idle" | "playing" | "completed";
export type Answer = "yes" | "no" | null;

export interface GameRound {
  topWord: string;
  bottomWord: string;
  bottomColor: string;
  correctAnswer: "yes" | "no";
  userAnswer: Answer;
  timeRemaining: number;
}

export interface GameSession {
  difficulty: Difficulty;
  rounds: GameRound[];
  currentRound: number;
  score: number;
  date: string;
}

export interface GameHistory {
  sessions: GameSession[];
}
