// src/app/game/page.tsx
"use client";

import React, { useState } from "react";
import {
  VStack,
  Button,
  Text,
  HStack,
  Container,
  useDisclosure,
  Heading,
  Box,
} from "@chakra-ui/react";
import { GameGrid } from "../../components/GameGrid";
import { GameInstructions } from "../../components/GameInstructions";
import { ScoreHistory } from "../../components/ScoreHistory";
import { useGameLogic } from "../../hooks/useGameLogic";

export default function MemoryMatrixGame() {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const {
    gameState,
    tile,
    handleCellClick,
    startNextRound,
    resetGame,
  } = useGameLogic(difficulty);

  const {
    isOpen: isInstructionsOpen,
    onOpen: onInstructionsOpen,
    onClose: onInstructionsClose,
  } = useDisclosure();

  const {
    isOpen: isScoreHistoryOpen,
    onOpen: onScoreHistoryOpen,
    onClose: onScoreHistoryClose,
  } = useDisclosure();

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState.isShowingPattern) {
      timer = setTimeout(() => {
        startNextRound();
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [gameState.isShowingPattern, startNextRound]);

  return (
    <Container maxW="container.md" centerContent>
      <VStack spacing={6} width="full" py={10}>
        <Heading>Memory Matrix</Heading>

        <HStack>
          <Button
            onClick={() => setDifficulty("easy")}
            colorScheme={difficulty === "easy" ? "green" : "blackAlpha"}
          >
            Easy
          </Button>
          <Button
            onClick={() => setDifficulty("medium")}
            colorScheme={difficulty === "medium" ? "yellow" : "blackAlpha"}
          >
            Medium
          </Button>
          <Button
            onClick={() => setDifficulty("hard")}
            colorScheme={difficulty === "hard" ? "red" : "blackAlpha"}
          >
            Hard
          </Button>
        </HStack>

        <HStack width="full" justify="space-between">
          <Button
            onClick={onInstructionsOpen}
            colorScheme="blue"
            variant="outline"
          >
            Instructions
          </Button>
          <Button
            onClick={resetGame}
            colorScheme="green"
            variant="outline"
          >
            Reset Game
          </Button>
          <Button
            onClick={onScoreHistoryOpen}
            colorScheme="green"
            variant="outline"
          >
            Score History
          </Button>
        </HStack>

        {gameState.isGameOver ? (
          <VStack spacing={4}>
            <Heading size="lg">Game Over!</Heading>
            <Text fontSize="xl">Your Score: {gameState.score}</Text>
            <Button onClick={resetGame} colorScheme="blue">
              Play Again
            </Button>
          </VStack>
        ) : (
          <Box w={"100%"}>
            <Text mb={4}>
              Round: {gameState.currentRound} | Status:{" "}
              {gameState.isShowingPattern ? "Memorize Pattern" : "Your Turn"}
            </Text>
            <GameGrid
              gridSize={tile + 4}
              sequence={gameState.sequence}
              userSequence={gameState.userSequence}
              isShowingPattern={gameState.isShowingPattern}
              onCellClick={handleCellClick}
              isGameOver={gameState.isGameOver}
            />
          </Box>
        )}
      </VStack>

      <GameInstructions
        isOpen={isInstructionsOpen}
        onClose={onInstructionsClose}
      />
      <ScoreHistory isOpen={isScoreHistoryOpen} onClose={onScoreHistoryClose} />
    </Container>
  );
}
