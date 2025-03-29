"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useColorModeValue,
} from "@chakra-ui/react";
import { getCompletedGames } from "@/lib/sudoku/storageUtils";
import SudokuBoard from "@/components/SudokuBoard";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { formatTime } from "@/lib/time";
import { useRouter } from "next/navigation";

interface GameInstance {
  gridSize: number;
  board: number[][];
  originalBoard: number[][];
  timeTaken: number;
  completedAt: string;
}
export default function History() {
  const [completedGames, setCompletedGames] = useState<GameInstance[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameInstance | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const games = getCompletedGames();
    setCompletedGames(games);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const viewGame = (game: GameInstance) => {
    setSelectedGame(game);
    onOpen();
  };

  const router = useRouter();
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.600", "whiteAlpha.700");

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box>
            <Button
              leftIcon={<ChevronLeftIcon />}
              mb={4}
              onClick={() => router.push("/games/sudoku")}
            >
              Back to Game
            </Button>

            <Heading color={textColor} as="h1" size="xl" mb={2}>
              Sudoku History
            </Heading>
            <Text fontSize="lg" color={subTextColor} mb={6}>
              See your completed puzzles
            </Text>
          </Box>
        </motion.div>

        {completedGames.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Box p={8} textAlign="center" borderWidth={1} borderRadius="lg">
              <Text fontSize="xl" color={textColor}>
                No completed games yet.
              </Text>
              <Button
                mt={4}
                colorScheme="blue"
                onClick={() => router.push("/games/sudoku")}
              >
                Start Playing
              </Button>
            </Box>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Box borderWidth={1} borderRadius="lg" overflow="hidden">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Grid Size</Th>
                    <Th>Time Taken</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {completedGames.map((game, index) => (
                    <Tr key={index} color={textColor}>
                      <Td>{formatDate(game.completedAt)}</Td>
                      <Td>
                        {game.gridSize}×{game.gridSize}
                      </Td>
                      <Td>{formatTime(game.timeTaken)}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => viewGame(game)}
                        >
                          View
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </motion.div>
        )}
      </VStack>

      {/* Modal for viewing completed game */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>
            Completed {selectedGame?.gridSize}×{selectedGame?.gridSize} Game
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody pb={6}>
            {selectedGame && (
              <VStack spacing={4}>
                <Text fontSize="lg" color={subTextColor}>
                  Completed on: {formatDate(selectedGame.completedAt)}
                </Text>
                <Text color={subTextColor}>Time taken: {formatTime(selectedGame.timeTaken)}</Text>
                <Box rounded={'lg'} p={4} bg={'white'}>
                  <SudokuBoard
                    board={selectedGame.board}
                    originalBoard={selectedGame.originalBoard}
                    gridSize={selectedGame.gridSize}
                    selectedCell={null}
                    onCellSelect={() => {}}
                    gameCompleted={true}
                  />
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
}
