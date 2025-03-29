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
  useColorModeValue,
  IconButton,
  Tooltip,
  Badge,
} from "@chakra-ui/react";
import { GameGrid } from "../../../components/GameGrid";
import { GameInstructions } from "../../../components/GameInstructions";
import { ScoreHistory } from "../../../components/ScoreHistory";
import { useGameLogic } from "../../../hooks/useGameLogic";
import { FiBookmark, FiInfo, FiRefreshCw } from "react-icons/fi";

export default function MemoryMatrixGame() {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const { gameState, tile, handleCellClick, startNextRound, resetGame } =
    useGameLogic(difficulty);

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

  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");

  return (
    <Container maxW="container.md" centerContent>
      <VStack spacing={6} width="full" py={10}>
        <HStack width="full" gap={4} justify="space-between">
          <Heading
            size={{
              base: "lg",
              md: "xl",
            }}
            color={textColor}
          >
            Memory Matrix
          </Heading>
          <HStack spacing={4}>
            <HStack width="full" justify="space-between">
              <Tooltip hasArrow label="Starts a new game" placement="top">
                <IconButton
                  onClick={resetGame}
                  colorScheme="red"
                  aria-label="Reset Game"
                  icon={<FiRefreshCw />}
                  rounded="full"
                />
              </Tooltip>
              <Tooltip
                hasArrow
                label="Get instructions on how to play"
                placement="top"
              >
                <IconButton
                  onClick={onInstructionsOpen}
                  colorScheme="teal"
                  aria-label="Instructions"
                  icon={<FiInfo />}
                  rounded="full"
                />
              </Tooltip>
              <Tooltip hasArrow label="View your score history" placement="top">
                <IconButton
                  onClick={onScoreHistoryOpen}
                  colorScheme="cyan"
                  aria-label="Score History"
                  icon={<FiBookmark />}
                  rounded="full"
                />
              </Tooltip>
            </HStack>
          </HStack>
        </HStack>

        <HStack>
          <Button
            onClick={() => setDifficulty("easy")}
            colorScheme={difficulty === "easy" ? "green" : "gray"}
          >
            Easy
          </Button>
          <Button
            onClick={() => setDifficulty("medium")}
            colorScheme={difficulty === "medium" ? "yellow" : "gray"}
          >
            Medium
          </Button>
          <Button
            onClick={() => setDifficulty("hard")}
            colorScheme={difficulty === "hard" ? "red" : "gray"}
          >
            Hard
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
            <Text textAlign={"center"} mb={4} fontSize="xl" color={textColor}>
              Round: {gameState.currentRound} |
              <Badge colorScheme="teal" fontSize="md" ml={2}>
                {gameState.isShowingPattern ? "Memorize Pattern" : "Your Turn"}
              </Badge>
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
