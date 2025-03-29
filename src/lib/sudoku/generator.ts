interface SudokuBoard extends Array<Array<number>> {
  [key: number]: Array<number>;
}

// Generate a new Sudoku board of the given size
export const generateSudokuBoard = (size: number) => {
  // Initialize empty board
  const board: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
  const solution: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));

  // Solve the empty board to generate a complete solution
  solveSudoku(solution, size);

  // Copy solution to the player's board
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      board[i][j] = solution[i][j];
    }
  }

  // Remove numbers to create the puzzle
  const cellsToRemove = Math.floor(size * size * 0.6); // Remove about 60% of numbers

  let count = 0;
  while (count < cellsToRemove) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);

    if (board[row][col] !== 0) {
      board[row][col] = 0;
      count++;
    }
  }

  return { board, solution };
};

// Solve the Sudoku puzzle using backtracking
const solveSudoku = (board: SudokuBoard, size: number) => {
  const emptyCell = findEmptyCell(board, size);

  // If no empty cell found, board is solved
  if (!emptyCell) return true;

  const [row, col] = emptyCell;
  const numbers = getShuffledNumbers(size);

  for (const num of numbers) {
    if (isValidPlacement(board, row, col, num, size)) {
      board[row][col] = num;

      if (solveSudoku(board, size)) {
        return true;
      }

      // If solution not found, backtrack
      board[row][col] = 0;
    }
  }

  return false;
};

// Find an empty cell in the board
const findEmptyCell = (board: SudokuBoard, size: number) => {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === 0) {
        return [row, col];
      }
    }
  }
  return null;
};

// Check if a number placement is valid
const isValidPlacement = (
  board: SudokuBoard,
  row: number,
  col: number,
  num: number,
  size: number
): boolean => {
  // Check row
  for (let i = 0; i < size; i++) {
    if (board[row][i] === num) {
      return false;
    }
  }

  // Check column
  for (let i = 0; i < size; i++) {
    if (board[i][col] === num) {
      return false;
    }
  }

  // Check box (subgrid)
  const boxSize = Math.sqrt(size);
  const boxRowStart = Math.floor(row / boxSize) * boxSize;
  const boxColStart = Math.floor(col / boxSize) * boxSize;

  for (let i = 0; i < boxSize; i++) {
    for (let j = 0; j < boxSize; j++) {
      if (board[boxRowStart + i][boxColStart + j] === num) {
        return false;
      }
    }
  }

  return true;
};

// Get an array of shuffled numbers from 1 to size
const getShuffledNumbers = (size: number) => {
  const numbers = Array.from({ length: size }, (_, i) => i + 1);

  // Fisher-Yates shuffle
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  return numbers;
};

// Verify if the board has a unique solution
export const hasUniqueSolution = (board: SudokuBoard, size: number) => {
  // Count solutions using backtracking
  let solutionCount = 0;

  const countSolutions = (board: SudokuBoard, size: number) => {
    const emptyCell = findEmptyCell(board, size);

    // If no empty cell found, we found a solution
    if (!emptyCell) {
      solutionCount++;
      return;
    }

    if (solutionCount > 1) return; // Early termination if multiple solutions found

    const [row, col] = emptyCell;

    for (let num = 1; num <= size; num++) {
      if (isValidPlacement(board, row, col, num, size)) {
        board[row][col] = num;
        countSolutions(board, size);
        board[row][col] = 0; // Backtrack
      }
    }
  };

  // Create a copy of the board
  const boardCopy = board.map((row) => [...row]);
  countSolutions(boardCopy, size);

  return solutionCount === 1;
};

// Generate a valid puzzle with a unique solution
export const generateValidPuzzle = (size: number) => {
  let { board, solution } = generateSudokuBoard(size);

  // Ensure the puzzle has a unique solution
  // This is a simplified approach - in a production app,
  // you might want a more sophisticated algorithm
  while (!hasUniqueSolution(board, size)) {
    ({ board, solution } = generateSudokuBoard(size));
  }

  return { board, solution };
};
