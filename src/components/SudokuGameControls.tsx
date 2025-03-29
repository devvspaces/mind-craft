// components/GameControls.js
import { Box, SimpleGrid, Button } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionButton = motion(Button);

const GameControls = ({
  gridSize,
  onNumberInput,
  gameCompleted,
}: {
  gridSize: number;
  onNumberInput: (num: number) => void;
  gameCompleted: boolean;
}) => {
  const numbers = [...Array(gridSize + 1).keys()].slice(1); // Create array [1, 2, ..., gridSize]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Box mt={4}>
        <SimpleGrid
          columns={Math.min(5, gridSize)}
          spacing={2}
          maxW="500px"
          mx="auto"
        >
          {numbers.map((num) => (
            <MotionButton
              key={`num-${num}`}
              size="lg"
              variant="outline"
              colorScheme="blue"
              onClick={() => onNumberInput(num)}
              disabled={gameCompleted}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(66, 153, 225, 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              {num}
            </MotionButton>
          ))}
          <MotionButton
            size="lg"
            variant="outline"
            colorScheme="red"
            onClick={() => onNumberInput(0)}
            disabled={gameCompleted}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(229, 62, 62, 0.1)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            Erase
          </MotionButton>
        </SimpleGrid>
      </Box>
    </motion.div>
  );
};

export default GameControls;
