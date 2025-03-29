export function generateGridSequence(gridSize: number): number[] {
  const totalCells = gridSize * gridSize;

  // Determine sequence length based on total cells, it should be the quarter of total cells
  const sequenceLength = Math.floor(totalCells / 4);

  // If requested sequence length is larger than total cells, throw an error
  if (sequenceLength > totalCells) {
    throw new Error('Sequence length cannot exceed total number of grid cells');
  }

  const sequence: number[] = [];
  while (sequence.length < sequenceLength) {
    const randomCell = Math.floor(Math.random() * totalCells);
    
    // Only add if not already in the sequence
    if (!sequence.includes(randomCell)) {
      sequence.push(randomCell);
    }
  }

  return sequence;
}

export function checkSequenceMatch(original: number[], user: number[]): boolean {
  if (original.length !== user.length) return false;
  const sortedOriginal = [...original].sort((a, b) => a - b);
  const sortedUser = [...user].sort((a, b) => a - b);
  return sortedOriginal.every((value, index) => value === sortedUser[index]);
}

export function calculateScore(difficulty: number): number {
  return (difficulty + 1) * 10;
}
