// src/components/ScoreHistory.tsx
import React from 'react';
import { 
  VStack, 
  Text, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalCloseButton,
  Box,
  Flex,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';
import { getGameScores } from '../hooks/useLocalStorage';
import { GameScore } from '../types/game';

interface ScoreHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScoreHistory: React.FC<ScoreHistoryProps> = ({ isOpen, onClose }) => {
  const scores = getGameScores();
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Score History</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {scores.length === 0 ? (
            <Text color={textColor} textAlign="center">
              No scores yet. Play a game to track your progress!
            </Text>
          ) : (
            <VStack spacing={3} maxHeight="300px" overflowY="auto">
              {scores.slice().reverse().map((score: GameScore, index: number) => (
                <Box 
                  key={index} 
                  bg={bgColor} 
                  p={3} 
                  borderRadius="md" 
                  width="full"
                >
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Text color={textColor} fontWeight="bold">
                        Score: {score.score}
                      </Text>
                      <Text color="gray.500" fontSize="sm">
                        {formatDate(score.timestamp)}
                      </Text>
                    </VStack>
                    <Badge 
                      colorScheme={
                        score.difficulty === 'easy' 
                          ? 'green' 
                          : score.difficulty === 'medium' 
                            ? 'yellow' 
                            : 'red'
                      }
                    >
                      {score.difficulty.toUpperCase()}
                    </Badge>
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};