// src/hooks/useGameLogic.ts
import { useState, useCallback } from "react";
import {
  generateGridSequence,
  checkSequenceMatch,
  calculateScore,
} from "../lib/gameUtils";
import { saveGameScore } from "./useLocalStorage";

export function useGameLogic(difficulty: "easy" | "medium" | "hard") {
  const [tile, setTile] = useState(0);
  const gridSize = tile + 4;
  const [gameState, setGameState] = useState({
    sequence: generateGridSequence(gridSize),
    userSequence: [] as number[],
    isShowingPattern: true,
    currentRound: 1,
    isGameOver: false,
    score: 0,
  });

  const resetGame = useCallback(() => {
    setGameState({
      sequence: generateGridSequence(gridSize),
      userSequence: [],
      isShowingPattern: true,
      currentRound: 1,
      isGameOver: false,
      score: 0,
    });
    setTile(0);
  }, [gridSize]);

  const handleCellClick = useCallback(
    (cellIndex: number) => {
      if (gameState.isShowingPattern || gameState.isGameOver) return;

      // ignore if the cell is already selected
      if (gameState.userSequence.includes(cellIndex)) return;

      const newUserSequence = [...gameState.userSequence, cellIndex];
      setGameState((prev) => ({
        ...prev,
        userSequence: newUserSequence,
      }));

      // Check if user sequence matches original sequence
      console.log("User sequence:", newUserSequence);
      console.log("Game sequence:", gameState.sequence);
      if (newUserSequence.length === gameState.sequence.length) {
        console.log("Checking sequence match...");
        console.log("User sequence:", newUserSequence);
        console.log("Game sequence:", gameState.sequence);
        const isCorrect = checkSequenceMatch(
          gameState.sequence,
          newUserSequence
        );

        if (isCorrect) {
          // Progress to next round
          const newScore = calculateScore(tile);
          if (gameState.currentRound >= 15) {
            setGameState((prev) => {
              saveGameScore({
                score: prev.score + newScore,
                timestamp: Date.now(),
                difficulty,
              });
              return {
                ...prev,
                isGameOver: true,
                score: prev.score + newScore,
              };
            });
            setTile(0);
          } else {
            setTile((prev) => Math.min(15, prev + 1));
            setGameState((prev) => ({
              ...prev,
              currentRound: prev.currentRound + 1,
              sequence: generateGridSequence(gridSize),
              userSequence: [],
              isShowingPattern: true,
              score: newScore,
            }));
          }
        } else {
          if (gameState.currentRound >= 15) {
            setGameState((prev) => {
              return {
                ...prev,
                isGameOver: true,
              };
            });
            setTile(0);
          } else {
            setTile((prev) => Math.max(0, prev - 1));
            setGameState((prev) => ({
              ...prev,
              currentRound: prev.currentRound + 1,
              sequence: generateGridSequence(gridSize),
              userSequence: [],
              isShowingPattern: true,
            }));
          }
        }
      }
    },
    [gameState, difficulty, gridSize, tile]
  );

  const startNextRound = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isShowingPattern: false,
      userSequence: [],
    }));
  }, []);

  return {
    gameState,
    tile,
    setTile,
    handleCellClick,
    startNextRound,
    resetGame,
  };
}
