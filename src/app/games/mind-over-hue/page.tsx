"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Select,
  Text,
  VStack,
  HStack,
  useToast,
  Badge,
  Grid,
  GridItem,
  List,
  ListItem,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Stack,
  Flex,
  useDisclosure,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheck,
  FaHistory,
  FaQuestion,
  FaTimes,
  FaTrophy,
} from "react-icons/fa";

// Game configuration
const COLOR_HEX = {
  Red: "red.500",
  Green: "green.500",
  Blue: "blue.500",
  Yellow: "yellow.500",
  Purple: "purple.500",
  Orange: "orange.500",
};
type ColorT = keyof typeof COLOR_HEX;
const COLORS: ColorT[] = ["Red", "Green", "Blue", "Yellow", "Purple", "Orange"];

const DIFFICULTY_CONFIG = {
  Easy: { rounds: 15, timePerRound: 5 },
  Medium: { rounds: 15, timePerRound: 3 },
  Hard: { rounds: 15, timePerRound: 2 },
};

// LocalStorage key
const LOCAL_STORAGE_KEY = "stroop_game_data";

// Define types
type Difficulty = "Easy" | "Medium" | "Hard";
type GameState = "idle" | "playing" | "completed";
type Answer = "yes" | "no" | null;

interface GameRound {
  topWord: string;
  bottomWord: string;
  bottomColor: ColorT;
  correctAnswer: "yes" | "no";
  userAnswer: Answer;
  timeRemaining: number;
}

interface GameSession {
  difficulty: Difficulty;
  rounds: GameRound[];
  currentRound: number;
  score: number;
  date: string;
}

interface GameHistory {
  sessions: GameSession[];
}

export default function StroopGame() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Game state
  const [gameState, setGameState] = useState<GameState>("idle");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [currentSession, setCurrentSession] = useState<GameSession | null>(
    null
  );
  const [gameHistory, setGameHistory] = useState<GameHistory>({ sessions: [] });
  const [streak, setStreak] = useState<number>(0);
  const [feedbackColor, setFeedbackColor] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load game data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log("Loaded game data:", parsedData);

        // Load history
        if (parsedData.history) {
          setGameHistory(parsedData.history);
        }
      }
    } catch (error) {
      console.error("Failed to load game data:", error);
      toast({
        title: "Failed to load saved game",
        status: "error",
        duration: 3000,
      });
    }
  }, [toast]);

  // Save game data to localStorage whenever it changes
  const saveState = () => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        parsedData.gameState = gameState;
        parsedData.currentSession = currentSession;
        const savedHistory = parsedData.history || { sessions: [] };
        savedHistory.sessions.push(currentSession);
        parsedData.history = savedHistory;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedData));
      } else {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({
            gameState,
            currentSession,
            history: gameHistory,
          })
        );
      }
    } catch (error) {
      console.error("Failed to save game data:", error);
      toast({
        title: "Failed to save game progress",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (gameState === "playing" && currentSession) {
      const currentRoundData =
        currentSession.rounds[currentSession.currentRound];

      if (currentRoundData.timeRemaining > 0) {
        timerRef.current = setTimeout(() => {
          const updatedSession = { ...currentSession };
          updatedSession.rounds[currentSession.currentRound].timeRemaining -= 1;
          setCurrentSession(updatedSession);
        }, 1000);
      } else {
        // Time's up for this round, move to next
        handleTimeUp();
      }

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [gameState, currentSession]);

  // Generate a new round with random colors
  const generateRound = (): GameRound => {
    const topWord = COLORS[Math.floor(Math.random() * COLORS.length)];
    const bottomWord = COLORS[Math.floor(Math.random() * COLORS.length)];

    // Decide if this round will have matching colors (to ensure balanced gameplay)
    const isMatching = Math.random() > 0.5;

    let bottomColor: ColorT;
    if (isMatching) {
      // For matching rounds, the bottom color should match the top word
      bottomColor = topWord;
    } else {
      // For non-matching rounds, choose a color different from the top word
      const availableColors = COLORS.filter((color) => color !== topWord);
      bottomColor =
        availableColors[Math.floor(Math.random() * availableColors.length)];
    }

    return {
      topWord,
      bottomWord,
      bottomColor,
      correctAnswer: topWord === bottomColor ? "yes" : "no",
      userAnswer: null,
      timeRemaining: DIFFICULTY_CONFIG[difficulty].timePerRound,
    };
  };

  // Start a new game
  const startGame = () => {
    // Clear any running timers
    if (timerRef.current) clearTimeout(timerRef.current);

    // Generate rounds
    const rounds: GameRound[] = [];
    for (let i = 0; i < DIFFICULTY_CONFIG[difficulty].rounds; i++) {
      rounds.push(generateRound());
    }

    // Create new session
    const newSession: GameSession = {
      difficulty,
      rounds,
      currentRound: 0,
      score: 0,
      date: new Date().toISOString(),
    };

    setCurrentSession(newSession);
    setGameState("playing");
    setStreak(0);
    setFeedbackColor(null);
  };

  // Handle user answer
  const handleAnswer = (answer: "yes" | "no") => {
    if (gameState !== "playing" || !currentSession) return;

    const session = { ...currentSession };
    const roundData = session.rounds[session.currentRound];

    // Record user's answer
    roundData.userAnswer = answer;

    // Check if answer is correct
    const isCorrect = answer === roundData.correctAnswer;

    // Update score and streak
    if (isCorrect) {
      session.score += 1;
      setStreak((prev) => prev + 1);
      setFeedbackColor("green.200");
    } else {
      setStreak(0);
      setFeedbackColor("red.200");
    }

    // Save updated round data
    session.rounds[session.currentRound] = roundData;

    // Move to next round or end game
    if (session.currentRound < session.rounds.length - 1) {
      setTimeout(() => {
        session.currentRound += 1;
        setCurrentSession(session);
        setFeedbackColor(null);
      }, 500);
    } else {
      // Game completed
      finishGame(session);
    }

    setCurrentSession(session);
  };

  // Handle when time runs out for a round
  const handleTimeUp = () => {
    if (!currentSession) return;

    const session = { ...currentSession };
    const roundData = session.rounds[session.currentRound];

    // If user hasn't answered, mark as incorrect
    if (roundData.userAnswer === null) {
      roundData.userAnswer = roundData.correctAnswer === "yes" ? "no" : "yes";
      setStreak(0);
      setFeedbackColor("red.200");
    }

    // Save updated round data
    session.rounds[session.currentRound] = roundData;

    // Move to next round or end game
    if (session.currentRound < session.rounds.length - 1) {
      setTimeout(() => {
        session.currentRound += 1;
        setCurrentSession(session);
        setFeedbackColor(null);
      }, 500);
    } else {
      // Game completed
      finishGame(session);
    }

    setCurrentSession(session);
  };

  // Finish game and update history
  const finishGame = (finalSession: GameSession) => {
    saveState();

    // Update game history
    const updatedHistory = { ...gameHistory };
    updatedHistory.sessions.push(finalSession);

    // Sort sessions by score (highest first)
    updatedHistory.sessions.sort((a, b) => b.score - a.score);

    setGameHistory(updatedHistory);
    setGameState("completed");
    setStreak(0);

    // Clear any running timers
    if (timerRef.current) clearTimeout(timerRef.current);

    toast({
      title: "Game Completed!",
      description: `Final Score: ${finalSession.score}/${finalSession.rounds.length}`,
      status: "success",
      duration: 5000,
    });
  };

  // Get the current round data
  const getCurrentRound = () => {
    if (!currentSession) return null;
    return currentSession.rounds[currentSession.currentRound];
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Get highest score from history
  const getHighestScore = () => {
    if (gameHistory.sessions.length === 0) return 0;
    return gameHistory.sessions[0].score;
  };

  const textColor = useColorModeValue("gray.800", "white");

  // Render game content based on state
  const renderGameContent = () => {
    const currentRound = getCurrentRound();

    if (gameState === "idle") {
      return (
        <VStack spacing={6} align="center" w="full">
          <HStack
            mb={6}
            w="full"
            justify="space-between"
            align="center"
            wrap={"wrap"}
          >
            <Heading color={textColor} as="h1" size="xl" textAlign="center">
              Mind Over Hue
            </Heading>
            <HStack>
              <Tooltip label="View game history">
                <IconButton
                  icon={<FaHistory />}
                  onClick={onOpen}
                  aria-label="View history"
                  rounded={"full"}
                  colorScheme="teal"
                />
              </Tooltip>
              <Tooltip label="How to play">
                <IconButton
                  colorScheme="cyan"
                  icon={<FaQuestion />}
                  onClick={() => {
                    toast({
                      title: "How to Play",
                      description:
                        "Decide if the color of the bottom word matches the meaning of the top word. The color of the bottom word may not match the meaning of the top word. Click 'Yes' if they match, or 'No' if they don't.",
                      status: "info",
                      isClosable: true,
                      position: "top",
                    });
                  }}
                  aria-label="Help"
                  rounded={"full"}
                />
              </Tooltip>
            </HStack>
          </HStack>

          <Box w="full" maxW="md" p={4}>
            <Text mb={2} color={textColor}>
              Select Difficulty:
            </Text>
            <Select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              mb={6}
              bg={"whiteAlpha.900"}
            >
              <option value="Easy">
                Easy ({DIFFICULTY_CONFIG.Easy.rounds} rounds,{" "}
                {DIFFICULTY_CONFIG.Easy.timePerRound}s per round)
              </option>
              <option value="Medium">
                Medium ({DIFFICULTY_CONFIG.Medium.rounds} rounds,{" "}
                {DIFFICULTY_CONFIG.Medium.timePerRound}s per round)
              </option>
              <option value="Hard">
                Hard ({DIFFICULTY_CONFIG.Hard.rounds} rounds,{" "}
                {DIFFICULTY_CONFIG.Hard.timePerRound}s per round)
              </option>
            </Select>

            <Button
              colorScheme="green"
              size="lg"
              width="full"
              onClick={startGame}
              as={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Game
            </Button>
          </Box>
        </VStack>
      );
    }

    if (gameState === "playing" && currentRound && currentSession) {
      const roundNumber = currentSession.currentRound + 1;
      const totalRounds = currentSession.rounds.length;

      return (
        <AnimatePresence mode="wait">
          <motion.div
            key={`round-${currentSession.currentRound}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ width: "100%" }}
          >
            <Box
              w="full"
              p={6}
              borderRadius="lg"
              bg={feedbackColor || "white"}
              transition="background-color 0.3s"
              boxShadow="md"
              textAlign="center"
            >
              <HStack justify="space-between" mb={6}>
                <Badge colorScheme="blue" fontSize="md" p={2}>
                  Round: {roundNumber}/{totalRounds}
                </Badge>
                <Badge colorScheme="green" fontSize="md" p={2}>
                  Score: {currentSession.score}
                </Badge>
                <Badge colorScheme="orange" fontSize="md" p={2}>
                  Time: {currentRound.timeRemaining}s
                </Badge>
              </HStack>

              {streak > 2 && (
                <Badge colorScheme="purple" mb={4} p={2}>
                  🔥 Streak: {streak}
                </Badge>
              )}

              <VStack spacing={10} mb={8}>
                <motion.h2
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                >
                  <Heading as="h2" size="xl">
                    {currentRound.topWord}
                  </Heading>
                </motion.h2>

                <motion.h2
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                >
                  <Heading
                    as="h2"
                    size="xl"
                    color={COLOR_HEX[currentRound.bottomColor]}
                  >
                    {currentRound.bottomWord}
                  </Heading>
                </motion.h2>
              </VStack>

              <HStack spacing={6} justify="center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    size="lg"
                    colorScheme="green"
                    onClick={() => handleAnswer("yes")}
                    aria-label="Yes, they match"
                    leftIcon={<FaCheck />}
                    px={10}
                  >
                    Yes
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    size="lg"
                    colorScheme="red"
                    onClick={() => handleAnswer("no")}
                    aria-label="No, they don't match"
                    leftIcon={<FaTimes />}
                    px={10}
                  >
                    No
                  </Button>
                </motion.div>
              </HStack>

              <Text fontSize="sm" mt={8} color="gray.500">
                Does the color of the bottom word match the meaning of the top
                word?
              </Text>
            </Box>
            <HStack justify="space-between" mt={6}>
              <Button colorScheme="yellow" onClick={startGame}>
                Restart
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  setGameState("idle");
                  setCurrentSession(null);
                  setStreak(0);
                }}
              >
                End
              </Button>
            </HStack>
          </motion.div>
        </AnimatePresence>
      );
    }

    if (gameState === "completed" && currentSession) {
      return (
        <VStack spacing={6} align="center" w="full">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Heading
              color={textColor}
              as="h1"
              size="xl"
              textAlign="center"
              mb={2}
            >
              Game Completed!
            </Heading>
          </motion.div>

          <Box
            w="full"
            p={6}
            borderRadius="lg"
            bg="blue.50"
            boxShadow="md"
            textAlign="center"
          >
            <Heading as="h2" size="lg" mb={4}>
              Final Score: {currentSession.score}/{currentSession.rounds.length}
            </Heading>

            <Text fontSize="xl" mb={6}>
              Difficulty: {currentSession.difficulty}
            </Text>

            <Text fontSize="md" mb={2}>
              Completed on: {formatDate(currentSession.date)}
            </Text>

            <Button
              colorScheme="blue"
              size="lg"
              mt={6}
              onClick={startGame}
              as={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Play Again
            </Button>
          </Box>
        </VStack>
      );
    }

    return null;
  };

  // Render game history
  const renderGameHistory = () => {
    const highestScore = getHighestScore();

    return (
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Game History</DrawerHeader>
          <DrawerBody>
            {gameHistory.sessions.length > 0 ? (
              <List spacing={3}>
                {gameHistory.sessions.map((session, index) => (
                  <ListItem
                    key={index}
                    p={3}
                    borderRadius="md"
                    bg="gray.50"
                    _dark={{ bg: "gray.700" }}
                  >
                    <Stack>
                      <Flex justify="space-between">
                        <Text fontWeight="bold">
                          Score: {session.score}/{session.rounds.length} (
                          {Math.round(
                            (session.score / session.rounds.length) * 100
                          )}
                          %)
                          {session.score === highestScore &&
                            session.score > 0 && (
                              <FaTrophy
                                style={{
                                  display: "inline",
                                  marginLeft: "8px",
                                  color: "gold",
                                }}
                              />
                            )}
                        </Text>
                        <Badge
                          colorScheme={
                            session.difficulty === "Easy"
                              ? "green"
                              : session.difficulty === "Medium"
                              ? "blue"
                              : "red"
                          }
                        >
                          {session.difficulty}
                        </Badge>
                      </Flex>
                      <Text fontSize="sm" color="gray.500">
                        {formatDate(session.date)}
                      </Text>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Text textAlign="center" mt={10} color="gray.500">
                No game history yet. Play a game to see your results here!
              </Text>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );

    return (
      <List spacing={3} w="full">
        {gameHistory.sessions.map((session, index) => (
          <ListItem
            key={index}
            p={3}
            borderRadius="md"
            bg={index === 0 ? "yellow.50" : "gray.50"}
            boxShadow="sm"
          >
            <Grid templateColumns="1fr auto" gap={4} alignItems="center">
              <GridItem>
                <Text fontWeight="bold">
                  {index === 0 && (
                    <FaTrophy
                      color="gold"
                      style={{ display: "inline", marginRight: "8px" }}
                    />
                  )}
                  Score: {session.score}/{session.rounds.length} (
                  {Math.round((session.score / session.rounds.length) * 100)}%)
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {session.difficulty} · {formatDate(session.date)}
                </Text>
              </GridItem>
              <GridItem>
                <Badge
                  colorScheme={
                    session.score === highestScore ? "yellow" : "gray"
                  }
                >
                  {session.difficulty}
                </Badge>
              </GridItem>
            </Grid>
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <Container maxW="container.md" py={8}>
      <Box>
        {renderGameContent()}
        {renderGameHistory()}
      </Box>
    </Container>
  );
}
