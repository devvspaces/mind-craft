// src/components/GameGrid.tsx
import React from 'react';
import { 
  Grid, 
  GridItem, 
  Box, 
  useColorModeValue 
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface GameGridProps {
  gridSize: number;
  sequence: number[];
  userSequence: number[];
  isShowingPattern: boolean;
  onCellClick: (index: number) => void;
  isGameOver: boolean;
}

export const GameGrid: React.FC<GameGridProps> = ({
  gridSize,
  sequence,
  userSequence,
  isShowingPattern,
  onCellClick,
  isGameOver
}) => {
  const gridBackground = useColorModeValue('gray.100', 'gray.700');
  const cellBackground = useColorModeValue('white', 'gray.600');
  const highlightColor = useColorModeValue('blue.500', 'blue.300');
  const selectedColor = useColorModeValue('green.500', 'green.300');

  const renderGrid = () => {
    const cells = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      const isInSequence = sequence.includes(i);
      const isUserSelected = userSequence.includes(i);

      cells.push(
        <GridItem key={i}>
          <motion.div
            whileHover={!isShowingPattern && !isGameOver ? { scale: 1.05 } : {}}
            whileTap={!isShowingPattern && !isGameOver ? { scale: 0.95 } : {}}
          >
            <Box
              w="full"
              h="full"
              aspectRatio={1}
              bg={cellBackground}
              border="2px"
              borderColor={gridBackground}
              rounded="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor={isShowingPattern || isGameOver ? 'default' : 'pointer'}
              onClick={() => !isShowingPattern && !isGameOver && onCellClick(i)}
              backgroundColor={
                isShowingPattern && isInSequence 
                  ? highlightColor 
                  : isUserSelected 
                    ? selectedColor 
                    : cellBackground
              }
              transition="all 0.2s"
            />
          </motion.div>
        </GridItem>
      );
    }
    return cells;
  };

  return (
    <Grid 
      templateColumns={`repeat(${gridSize}, 1fr)`}
      gap={2}
      bg={gridBackground}
      p={4}
      rounded="lg"
      maxWidth="500px"
      margin="0 auto"
    >
      {renderGrid()}
    </Grid>
  );
};