"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  Flex,
  HStack,
  IconButton,
  Center,
  Spinner,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import SudokuBoard from "@/components/SudokuBoard";
import GameControls from "@/components/SudokuGameControls";
import Celebration from "@/components/Celebration";
import HintSystem from "@/components/SudokuHintSystem";
import { generateValidPuzzle } from "@/lib/sudoku/generator";
import {
  saveGameState,
  loadGameState,
  saveCompletedGame,
} from "@/lib/sudoku/storageUtils";
import { FiBookmark, FiRefreshCw, FiX } from "react-icons/fi";
import { Board, BoardCell, GameState, Hints } from "@/types/sudoku";
import { formatTime } from "@/lib/time";
import { useRouter } from "next/navigation";

export default function Home() {
  const [gridSize, setGridSize] = useState(4);
  const [board, setBoard] = useState<Board>([]);
  const [originalBoard, setOriginalBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<BoardCell | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasResumedGame, setHasResumedGame] = useState(false);
  const [usedHints, setUsedHints] = useState<Hints[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [loadingNewGame, setLoadingNewGame] = useState(false);

  const toast = useToast();
  const router = useRouter();

  const resumeGame = useCallback(
    (savedGame: GameState) => {
      setGridSize(savedGame.gridSize);
      setBoard(savedGame.board);
      setOriginalBoard(savedGame.originalBoard);
      setSolution(savedGame.solution || []);
      setStartTime(Date.now() - savedGame.elapsedTime * 1000);
      setElapsedTime(savedGame.elapsedTime);
      setHasResumedGame(true);
      setUsedHints(savedGame.usedHints || []);

      toast({
        title: "Game resumed",
        description: "Your previous game has been loaded.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    [toast]
  );

  // Initialize game board or load saved game
  useEffect(() => {
    const savedGame = loadGameState();
    if (savedGame && !hasResumedGame) {
      toast({
        duration: 5000,
        position: "top",
        render: ({ onClose }) => (
          <Box
            p={3}
            bg="blue.500"
            color="white"
            borderRadius="md"
            boxShadow="lg"
          >
            <Flex justify="space-between" align="center">
              <Text fontWeight="bold">Game found</Text>
              <IconButton
                icon={<FiX />}
                aria-label="Close"
                variant="ghost"
                onClick={onClose}
              />
            </Flex>
            <Text mb={2}>
              A previous game was found. Would you like to resume?
            </Text>
            <Button
              colorScheme="blue"
              onClick={() => {
                resumeGame(savedGame);
                onClose();
              }}
            >
              Resume
            </Button>
          </Box>
        ),
      });
    }
    if (!board.length) {
      startNewGame(gridSize);
    }
  }, []);

  // Track elapsed time
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (startTime && !gameCompleted) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [startTime, gameCompleted]);

  // Check for win condition after each board update
  useEffect(() => {
    if (board.length > 0) {
      checkWinCondition();
      saveGameState({
        gridSize,
        board,
        originalBoard,
        solution,
        startTime,
        elapsedTime,
        usedHints,
      });
    }
  }, [board]);

  const startNewGame = (size: number) => {
    setLoadingNewGame(true);
    setTimeout(() => {
      const { board: newBoard, solution: newSolution } =
        generateValidPuzzle(size);
      setGridSize(size);
      setBoard(newBoard);
      setOriginalBoard(JSON.parse(JSON.stringify(newBoard))); // Deep copy
      setSolution(newSolution);
      setSelectedCell(null);
      setGameCompleted(false);
      setStartTime(Date.now());
      setElapsedTime(0);
      setHasResumedGame(false);
      setUsedHints([]);
      setShowCelebration(false);
      setLoadingNewGame(false);
    }, 100);
  };

  const handleCellSelect = (rowIndex: number, colIndex: number) => {
    // Don't allow selecting original filled cells
    if (originalBoard[rowIndex][colIndex] !== 0) return;

    setSelectedCell({ row: rowIndex, col: colIndex });
  };

  const handleNumberInput = (number: number) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;

    // Create a new board copy
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[row][col] = number === 0 ? 0 : number;

    // Validate move
    const isValid = validateMove(newBoard, row, col, number);

    if (!isValid && number !== 0) {
      // Visual indication of error
      toast({
        title: "Invalid move",
        description: `${number} already exists in this row, column, or box.`,
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }

    setBoard(newBoard);
  };

  const handleHintUsed = (row: number, col: number, value: number) => {
    // Create a new board copy
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[row][col] = value;
    setBoard(newBoard);
  };

  const validateMove = (
    board: Board,
    row: number,
    col: number,
    num: number
  ) => {
    if (num === 0) return true; // Erasing is always valid

    // Check row
    for (let i = 0; i < gridSize; i++) {
      if (i !== col && board[row][i] === num) {
        return false;
      }
    }

    // Check column
    for (let i = 0; i < gridSize; i++) {
      if (i !== row && board[i][col] === num) {
        return false;
      }
    }

    // Check box (subgrid)
    const boxSize = Math.sqrt(gridSize);
    const boxRowStart = Math.floor(row / boxSize) * boxSize;
    const boxColStart = Math.floor(col / boxSize) * boxSize;

    for (let i = boxRowStart; i < boxRowStart + boxSize; i++) {
      for (let j = boxColStart; j < boxColStart + boxSize; j++) {
        if (i !== row && j !== col && board[i][j] === num) {
          return false;
        }
      }
    }

    return true;
  };

  const checkWinCondition = () => {
    // Check if board is completely filled
    const isFilled = board.every((row) => row.every((cell) => cell !== 0));
    if (!isFilled) return;

    // Check if all rows, columns, and boxes are valid
    const isValid = checkBoardValidity();

    if (isValid) {
      setGameCompleted(true);
      setShowCelebration(true);

      // Store completed game
      saveCompletedGame({
        gridSize,
        board: board,
        originalBoard: originalBoard,
        completedAt: new Date().toISOString(),
        timeTaken: elapsedTime,
        usedHints: usedHints,
      });

      // Hide celebration after a delay
      setTimeout(() => {
        setShowCelebration(false);
      }, 5000);
    }
  };

  const checkBoardValidity = () => {
    // Check each row
    for (let row = 0; row < gridSize; row++) {
      const rowSet = new Set();
      for (let col = 0; col < gridSize; col++) {
        if (board[row][col] === 0 || rowSet.has(board[row][col])) {
          return false;
        }
        rowSet.add(board[row][col]);
      }
    }

    // Check each column
    for (let col = 0; col < gridSize; col++) {
      const colSet = new Set();
      for (let row = 0; row < gridSize; row++) {
        if (board[row][col] === 0 || colSet.has(board[row][col])) {
          return false;
        }
        colSet.add(board[row][col]);
      }
    }

    // Check each box
    const boxSize = Math.sqrt(gridSize);
    for (let boxRow = 0; boxRow < boxSize; boxRow++) {
      for (let boxCol = 0; boxCol < boxSize; boxCol++) {
        const boxSet = new Set();
        for (let row = boxRow * boxSize; row < (boxRow + 1) * boxSize; row++) {
          for (
            let col = boxCol * boxSize;
            col < (boxCol + 1) * boxSize;
            col++
          ) {
            if (board[row][col] === 0 || boxSet.has(board[row][col])) {
              return false;
            }
            boxSet.add(board[row][col]);
          }
        }
      }
    }

    return true;
  };

  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack width="full" justify="space-between">
          <Heading color={textColor}>Sudoku</Heading>
          <HStack spacing={4}>
            <HStack width="full" justify="space-between">
              <Tooltip hasArrow label="Starts a new game" placement="top">
                <IconButton
                  onClick={() => startNewGame(gridSize)}
                  colorScheme="green"
                  aria-label="Reset Game"
                  icon={<FiRefreshCw />}
                  rounded="full"
                />
              </Tooltip>
              <Tooltip hasArrow label="View your score history" placement="top">
                <IconButton
                  onClick={() => router.push("/games/sudoku/history")
                  }
                  colorScheme="cyan"
                  aria-label="Score History"
                  icon={<FiBookmark />}
                  rounded="full"
                />
              </Tooltip>
            </HStack>
          </HStack>
        </HStack>

        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <HStack wrap={'wrap'} spacing={2} align="center">
            <Button
              colorScheme={gridSize === 4 ? "green" : "gray"}
              onClick={() => startNewGame(4)}
              size="sm"
              rounded={'full'}
            >
              4 × 4
            </Button>
            <Button
              colorScheme={gridSize === 9 ? "green" : "gray"}
              onClick={() => startNewGame(9)}
              size="sm"
              rounded={'full'}
            >
              9 x 9
            </Button>
          </HStack>

          <Box>
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              Time: {formatTime(elapsedTime)}
            </Text>
          </Box>
        </Flex>

        <Box
          borderRadius="lg"
          overflow="hidden"
          p={5}
          bg="white"
          hidden={loadingNewGame}
          w={'fit-content'}
          mx={"auto"}
        >
          {board.length > 0 && (
            <SudokuBoard
              board={board}
              originalBoard={originalBoard}
              gridSize={gridSize}
              selectedCell={selectedCell}
              onCellSelect={handleCellSelect}
              gameCompleted={gameCompleted}
            />
          )}
        </Box>

        {board.length > 0 && !loadingNewGame && (
          <GameControls
            gridSize={gridSize}
            onNumberInput={handleNumberInput}
            gameCompleted={gameCompleted}
          />
        )}

        {loadingNewGame && (
          <Center>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              size="xl"
              color="blue.500"
              label="Loading new game..."
            />
          </Center>
        )}

        {solution.length > 0 && (
          <HintSystem
            board={board}
            solution={solution}
            usedHints={usedHints}
            setUsedHints={setUsedHints}
            onHintUsed={handleHintUsed}
            gameCompleted={gameCompleted}
          />
        )}
      </VStack>

      <Celebration
        isVisible={showCelebration}
        timeTaken={elapsedTime}
        gridSize={gridSize}
      />
    </Container>
  );
}
