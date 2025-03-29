export interface Hints {
  row: number;
  col: number;
  value: number;
}
export type Board = number[][];
export type GameState = {
  gridSize: number;
  board: Board;
  originalBoard: Board;
  solution: Board;
  startTime: number | null;
  elapsedTime: number;
  usedHints: Hints[];
}
export type BoardCell = {
  row: number;
  col: number;
};
export type CompletedGame = {
  gridSize: number;
  board: Board;
  originalBoard: Board;
  timeTaken: number;
  completedAt: string;
  usedHints: Hints[];
}
