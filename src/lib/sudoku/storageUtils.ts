import { CompletedGame, GameState } from "@/types/sudoku";

// Save current game state to localStorage
export const saveGameState = (gameState: GameState): boolean => {
  try {
    localStorage.setItem('sudokuGameState', JSON.stringify(gameState));
    return true;
  } catch (error) {
    console.error('Error saving game state:', error);
    return false;
  }
};

// Load game state from localStorage
export const loadGameState = () => {
  try {
    const gameState = localStorage.getItem('sudokuGameState');
    return gameState ? JSON.parse(gameState) : null;
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
};

// Clear game state from localStorage
export const clearGameState = () => {
  try {
    localStorage.removeItem('sudokuGameState');
    return true;
  } catch (error) {
    console.error('Error clearing game state:', error);
    return false;
  }
};

// Save completed game to history
export const saveCompletedGame = (gameData: CompletedGame): boolean => {
  try {
    const historyStr = localStorage.getItem('sudokuGameHistory');
    let history: CompletedGame[] = historyStr ? JSON.parse(historyStr) : [];
    
    // Add new game to beginning of array
    history.unshift(gameData);
    
    // Limit history to 10 games
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    
    localStorage.setItem('sudokuGameHistory', JSON.stringify(history));
    
    // Clear current game state
    clearGameState();
    
    return true;
  } catch (error) {
    console.error('Error saving completed game:', error);
    return false;
  }
};

// Get all completed games from history
export const getCompletedGames = () => {
  try {
    const historyStr = localStorage.getItem('sudokuGameHistory');
    return historyStr ? JSON.parse(historyStr) : [];
  } catch (error) {
    console.error('Error loading game history:', error);
    return [];
  }
};