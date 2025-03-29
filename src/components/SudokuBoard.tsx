// components/SudokuBoard.tsx
import { Box, Grid, GridItem } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { keyframes } from "@emotion/react";
import { Board, BoardCell } from "@/types/sudoku";

// Define types for props
interface SudokuBoardProps {
  board: Board;
  originalBoard: Board;
  gridSize: number;
  selectedCell: BoardCell | null;
  onCellSelect: (rowIndex: number, colIndex: number) => void;
  gameCompleted: boolean;
}

// Animation for new input
const popIn = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  70% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const MotionBox = motion(Box);

const SudokuBoard: React.FC<SudokuBoardProps> = ({
  board,
  originalBoard,
  gridSize,
  selectedCell,
  onCellSelect,
  gameCompleted,
}) => {
  const boxSize = Math.sqrt(gridSize);

  // Check if a position is in the same row, column, or box as the selected cell
  const isHighlighted = (rowIndex: number, colIndex: number): boolean => {
    if (!selectedCell) return false;

    const { row, col } = selectedCell;

    // Same row or column
    if (row === rowIndex || col === colIndex) return true;

    // Same box
    const selectedBoxRow = Math.floor(row / boxSize);
    const selectedBoxCol = Math.floor(col / boxSize);
    const cellBoxRow = Math.floor(rowIndex / boxSize);
    const cellBoxCol = Math.floor(colIndex / boxSize);

    return selectedBoxRow === cellBoxRow && selectedBoxCol === cellBoxCol;
  };

  // Check if the cell has the same value as the selected cell
  const hasSameValue = (rowIndex: number, colIndex: number): boolean => {
    if (!selectedCell) return false;

    const { row, col } = selectedCell;
    const selectedValue = board[row][col];

    return selectedValue !== 0 && selectedValue === board[rowIndex][colIndex];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box width="100%" mx="auto">
        <Grid
          templateColumns={`repeat(${gridSize}, 1fr)`}
          gap={0}
          width={{
            base: gridSize > 4 ? `${gridSize * 30}px` : `${gridSize * 50}px`,
            md: `${gridSize * 50}px`,
          }}
          maxW="100%"
          mx="auto"
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isOriginal = originalBoard[rowIndex][colIndex] !== 0;
              const isSelected =
                selectedCell &&
                selectedCell.row === rowIndex &&
                selectedCell.col === colIndex;

              // Determine cell border style
              const borderRight =
                (colIndex + 1) % boxSize === 0 && colIndex
                  ? "3px solid #333"
                  : "1px solid #ccc";
              const borderBottom =
                (rowIndex + 1) % boxSize === 0 && rowIndex
                  ? "3px solid #333"
                  : "1px solid #ccc";

              // Determine background color based on state
              let bgColor = "white";
              if (isSelected) {
                bgColor = "var(--chakra-colors-blue-100)";
              } else if (isHighlighted(rowIndex, colIndex)) {
                bgColor = "var(--chakra-colors-blue-50)";
              } else if (hasSameValue(rowIndex, colIndex)) {
                bgColor = "var(--chakra-colors-gray-100)";
              }

              return (
                <GridItem
                  key={`cell-${rowIndex}-${colIndex}`}
                  w={{
                    base: gridSize > 4 ? "30px" : "50px",
                    md: "50px",
                  }}
                  h={{
                    base: gridSize > 4 ? "30px" : "50px",
                    md: "50px",
                  }}
                  borderRight={borderRight}
                  borderBottom={borderBottom}
                  borderTop={rowIndex === 0 ? "3px solid #333" : ""}
                  borderLeft={colIndex === 0 ? "3px solid #333" : ""}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  bg={bgColor}
                  position="relative"
                  cursor={isOriginal || gameCompleted ? "default" : "pointer"}
                  onClick={() =>
                    !gameCompleted && onCellSelect(rowIndex, colIndex)
                  }
                  as={motion.div}
                  whileHover={
                    !isOriginal && !gameCompleted
                      ? { backgroundColor: "var(--chakra-colors-blue-50)" }
                      : {}
                  }
                  whileTap={
                    !isOriginal && !gameCompleted ? { scale: 0.95 } : {}
                  }
                >
                  {cell !== 0 && (
                    <MotionBox
                      key={`value-${cell}-${Date.now()}`}
                      position="absolute"
                      fontSize={{
                        base: gridSize > 4 ? "sm" : "2xl",
                        md: gridSize > 4 ? "xl" : "2xl",
                      }}
                      fontWeight={isOriginal ? "bold" : "normal"}
                      color={isOriginal ? "black" : "blue.600"}
                      animation={!isOriginal ? `${popIn} 0.3s` : "none"}
                    >
                      {cell}
                    </MotionBox>
                  )}
                </GridItem>
              );
            })
          )}
        </Grid>
      </Box>
    </motion.div>
  );
};

export default SudokuBoard;
