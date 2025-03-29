// components/HintSystem.js
import { useState } from "react";
import {
  Box,
  Tooltip,
  Text,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { QuestionIcon, InfoIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { Hints } from "@/types/sudoku";

const HintSystem = ({
  board,
  solution,
  usedHints,
  setUsedHints,
  onHintUsed,
  gameCompleted,
}: {
  board: number[][];
  solution: number[][];
  usedHints: Hints[];
  setUsedHints: (hints: Hints[]) => void;
  onHintUsed: (row: number, col: number, value: number) => void;
  gameCompleted: boolean;
}) => {
  const toast = useToast();
  const [hintsRemaining, setHintsRemaining] = useState(3);

  const getHint = () => {
    if (hintsRemaining <= 0) {
      toast({
        title: "No hints remaining",
        description: "You've used all your available hints for this game.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Find a random empty cell to give a hint for
    const emptyCells = [];

    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length === 0) {
      toast({
        title: "No empty cells",
        description: "There are no empty cells to give a hint for.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Select a random empty cell
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { row, col } = emptyCells[randomIndex];

    // Get the correct value from the solution
    const correctValue = solution[row][col];

    // Call the callback to apply the hint
    onHintUsed(row, col, correctValue);

    // Update hint count and record the hint usage
    setHintsRemaining(hintsRemaining - 1);
    setUsedHints([...usedHints, { row, col, value: correctValue }]);

    toast({
      title: "Hint used",
      description: `Placed ${correctValue} at position (${row + 1}, ${
        col + 1
      }). ${hintsRemaining - 1} hints remaining.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");

  return (
    <Box textAlign="center" mt={3}>
      <Menu>
        <Tooltip label="Game options and help">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <MenuButton>
              <IconButton
                colorScheme="blue"
                icon={<InfoIcon />}
                variant="outline"
                aria-label="Game options"
                isDisabled={gameCompleted}
              />
            </MenuButton>
          </motion.button>
        </Tooltip>
        <MenuList>
          <MenuItem
            color={textColor}
            icon={<QuestionIcon />}
            onClick={getHint}
            isDisabled={gameCompleted || hintsRemaining <= 0}
          >
            Use hint ({hintsRemaining} remaining)
          </MenuItem>
        </MenuList>
      </Menu>

      {usedHints.length > 0 && (
        <Text fontSize="sm" color={textColor} mt={2}>
          Hint cells: {usedHints.length}
        </Text>
      )}
    </Box>
  );
};

export default HintSystem;
