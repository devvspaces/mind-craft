"use client";
import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  Badge,
  List,
  ListItem,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Select,
  Progress,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  Tooltip,
  Stack,
} from "@chakra-ui/react";

import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheck,
  FaTimes,
  FaTrophy,
  FaHistory,
  FaQuestion,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";

// Symbols for flashcards
// const SYMBOLS = ['★', '♦', '♠', '♣', '♥', '◆', '▲', '●', '■', '✦', '⚡', '♫'];

const SYMBOL1 = "■";
const SYMBOL2 = "♥";
const SYMBOLS = [SYMBOL1, SYMBOL2];

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: { timeLimit: 3000, cardDelay: 2000, points: 5, penalty: 2 },
  medium: { timeLimit: 2000, cardDelay: 1500, points: 10, penalty: 5 },
  hard: { timeLimit: 1000, cardDelay: 1000, points: 15, penalty: 10 },
};

type Difficulty = "easy" | "medium" | "hard";

interface GameResult {
  id: number;
  date: string;
  score: number;
  rounds: number;
  difficulty: Difficulty;
}

// Main Game Component
export default function SpeedMatchChallenge() {
  // Game state
  const [gameStatus, setGameStatus] = useState<"idle" | "playing" | "finished">(
    "idle"
  );
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [currentSymbol, setCurrentSymbol] = useState<string | null>(null);
  const [previousSymbol, setPreviousSymbol] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [round, setRound] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  // Refs (using number type for timer IDs in browser)
  const roundTimerRef = useRef<number | null>(null);
  const flipRef = useRef<number | null>(null);

  // Hooks
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cardBgColor = useColorModeValue("gray.700", "white");

  const successAudio = new Audio("/mixkit-winning-a-coin-video-game-2069.wav");

  // Load game history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("speedMatchHistory");
    if (savedHistory) {
      setGameHistory(JSON.parse(savedHistory) as GameResult[]);
    }

    // Cleanup on unmount
    return () => {
      if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    };
  }, []);

  // Start a new game
  const startGame = () => {
    setGameStatus("playing");
    setScore(0);
    setStreak(0);
    setRound(0);
    showNextCard();
  };

  // End the current game
  const endGame = () => {
    if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    setGameStatus("finished");

    // Save game to history
    const gameResult: GameResult = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      score,
      rounds: round,
      difficulty,
    };

    const updatedHistory = [gameResult, ...gameHistory].slice(0, 10); // Keep only the 10 most recent games
    setGameHistory(updatedHistory);
    localStorage.setItem("speedMatchHistory", JSON.stringify(updatedHistory));
  };

  // Show the next flashcard
  const showNextCard = () => {
    // Clear any existing timers
    if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    if (flipRef.current) clearTimeout(flipRef.current);

    // Update round
    setRound((prevRound) => Math.min(prevRound + 1, 20)); // Limit to 20 rounds

    // Move current to previous
    setPreviousSymbol(currentSymbol);

    // Get a new random symbol
    const randomIndex = Math.floor(Math.random() * SYMBOLS.length);

    // Flip card animation
    setIsFlipping(true);
    flipRef.current = window.setTimeout(() => {
      setCurrentSymbol(SYMBOLS[randomIndex]);
      setIsFlipping(false);

      // Set round timer
      setTimeLeft(100);
      const settings = DIFFICULTY_SETTINGS[difficulty];
      const interval = settings.timeLimit / 100;

      roundTimerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            // Time's up for this round
            if (roundTimerRef.current) clearInterval(roundTimerRef.current);
            handleAnswer(null); // No answer provided in time
            return 0;
          }
          return prev - 1;
        });
      }, interval);
    }, 300); // Flip animation duration
  };

  // Handle player's answer
  const handleAnswer = (isMatch: boolean | null) => {
    // Clear the round timer
    if (roundTimerRef.current) clearInterval(roundTimerRef.current);

    // If it's the first card, don't score but proceed to next
    if (round === 1) {
      showNextCard();
      return;
    }

    const settings = DIFFICULTY_SETTINGS[difficulty];
    const actualMatch = currentSymbol === previousSymbol;

    if (isMatch === actualMatch) {
      // Correct answer
      setScore((prev) => prev + settings.points);
      setStreak((prev) => prev + 1);

      // Bonus points for streaks
      if (streak > 0 && streak % 5 === 0) {
        setScore((prev) => prev + settings.points * 2);
        toast({
          title: "Streak Bonus!",
          description: `+${settings.points * 2} points`,
          status: "success",
          duration: 1000,
          isClosable: true,
          position: "top",
        });
      }

      // Success feedback
      if (soundEnabled) {
        // Add sound effect here if desired
        if (successAudio) {
          console.log("Playing success audio");
          successAudio.play();
        }
      }
    } else {
      // Wrong answer
      setScore((prev) => Math.max(0, prev - settings.penalty));
      setStreak(0);

      // Failure feedback
      if (soundEnabled) {
        // Add sound effect here if desired
      }
    }

    // Proceed to next card or end game
    if (round < 20) {
      showNextCard();
    } else {
      endGame();
    }
  };

  // Get highest score from history
  const getHighScore = (): number => {
    if (gameHistory.length === 0) return 0;
    return Math.max(...gameHistory.map((game) => game.score));
  };
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");

  return (
    <Box minH="100vh" py={5}>
      <Container maxW="container.md">
        <VStack spacing={6}>
          {/* Header */}
          <Flex w="full" justify="space-between" align="center" p={4}>
            <Heading w={"full"} size="lg" color={textColor}>
              Speed Match Challenge
            </Heading>
            <HStack>
              <Tooltip label={soundEnabled ? "Mute sounds" : "Enable sounds"}>
                <IconButton
                  icon={soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
                  rounded={"full"}
                />
              </Tooltip>
              <Tooltip label="View game history">
                <IconButton
                  icon={<FaHistory />}
                  onClick={onOpen}
                  aria-label="View history"
                  rounded={"full"}
                />
              </Tooltip>
              <Tooltip label="How to play">
                <IconButton
                  icon={<FaQuestion />}
                  onClick={() => {
                    toast({
                      title: "How to Play",
                      description:
                        "Decide if the current symbol matches the previous one. Answer quickly for more points!",
                      status: "info",
                      duration: 5000,
                      isClosable: true,
                    });
                  }}
                  aria-label="Help"
                  rounded={"full"}
                />
              </Tooltip>
            </HStack>
          </Flex>

          {/* Game Controls */}
          {gameStatus !== "playing" && (
            <VStack spacing={4} w="full">
              <Select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                maxW="sm"
                bg={"whiteAlpha.900"}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>

              <Button
                colorScheme="blue"
                size="lg"
                onClick={startGame}
                w="full"
                maxW="sm"
              >
                {gameStatus === "finished" ? "Play Again" : "Start Game"}
              </Button>

              {gameStatus === "finished" && (
                <VStack
                  spacing={2}
                  p={4}
                  bg="blue.100"
                  borderRadius="md"
                  w="full"
                  maxW="sm"
                >
                  <Heading size="md">Game Over!</Heading>
                  <Text fontWeight="bold">Final Score: {score}</Text>
                  <Text>Total Rounds: {round}</Text>
                  {score === getHighScore() && score > 0 && (
                    <HStack>
                      <FaTrophy color="gold" />
                      <Text color="yellow.600" fontWeight="bold">
                        New High Score!
                      </Text>
                    </HStack>
                  )}
                </VStack>
              )}
            </VStack>
          )}

          {/* Game Area */}
          {gameStatus === "playing" && (
            <VStack spacing={6} w="full">
              {/* Game Stats */}
              <HStack w="full" justify="space-between">
                <Badge colorScheme="purple" p={2} borderRadius="md">
                  Round: {round}/20
                </Badge>
                <Badge colorScheme="green" p={2} borderRadius="md">
                  Score: {score}
                </Badge>
                <Badge colorScheme="orange" p={2} borderRadius="md">
                  Streak: {streak}
                </Badge>
              </HStack>

              {/* Timer */}
              <Progress
                value={timeLeft}
                w="full"
                colorScheme="blue"
                size="sm"
                borderRadius="md"
              />

              {/* Flashcard */}
              <Box position="relative" w="full" h="200px">
                <AnimatePresence>
                  <motion.div
                    key={round}
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: isFlipping ? 90 : 0 }}
                    exit={{ rotateY: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card width={"200px"} height={"200px"} boxShadow={"none"}>
                      <CardBody
                        display={"flex"}
                        justifyContent={"center"}
                        alignItems={"center"}
                        fontSize="10rem"
                        position={"relative"}
                        p={0}
                      >
                        {currentSymbol ? (
                          <Square color={cardBgColor} />
                        ) : (
                          <Circle color={cardBgColor} />
                        )}
                      </CardBody>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </Box>

              {/* Answer Buttons */}
              <HStack spacing={8} w="full" justify="center">
                <IconButton
                  icon={<FaTimes size={24} />}
                  colorScheme="red"
                  size="lg"
                  h="60px"
                  w="60px"
                  isRound
                  onClick={() => handleAnswer(false)}
                  aria-label="No Match"
                />
                <IconButton
                  icon={<FaCheck size={24} />}
                  colorScheme="green"
                  size="lg"
                  h="60px"
                  w="60px"
                  isRound
                  onClick={() => handleAnswer(true)}
                  aria-label="Match"
                />
              </HStack>

              {/* First card help text */}
              {round === 1 && (
                <Text textAlign="center" fontSize="sm" color="gray.500">
                  First card! The next one will be the first match opportunity.
                </Text>
              )}
            </VStack>
          )}

          {/* High Score Display (when not playing) */}
          {gameStatus !== "playing" && getHighScore() > 0 && (
            <HStack>
              <FaTrophy color="gold" />
              <Text color={"green.300"} fontWeight="bold">
                High Score: {getHighScore()}
              </Text>
            </HStack>
          )}
        </VStack>
      </Container>

      {/* History Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Game History</DrawerHeader>
          <DrawerBody>
            {gameHistory.length > 0 ? (
              <List spacing={3}>
                {gameHistory.map((game) => (
                  <ListItem
                    key={game.id}
                    p={3}
                    borderRadius="md"
                    bg="gray.50"
                    _dark={{ bg: "gray.700" }}
                  >
                    <Stack>
                      <Flex justify="space-between">
                        <Text fontWeight="bold">
                          Score: {game.score}
                          {game.score === getHighScore() && game.score > 0 && (
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
                            game.difficulty === "easy"
                              ? "green"
                              : game.difficulty === "medium"
                              ? "blue"
                              : "red"
                          }
                        >
                          {game.difficulty}
                        </Badge>
                      </Flex>
                      <Text fontSize="sm" color="gray.500">
                        {game.date} • {game.rounds} rounds
                      </Text>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Text textAlign="center" mt={10} color="gray.500">
                No games played yet. Start playing to record your scores!
              </Text>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

function Square({ color }: { color: string }) {
  return <Box w={"100%"} height={"100%"} bg={color}></Box>;
}
function Circle({ color }: { color: string }) {
  return <Box w={"100%"} height={"100%"} bg={color} borderRadius={"50%"}></Box>;
}
