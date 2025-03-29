// src/components/GameInstructions.tsx
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
  useColorModeValue
} from '@chakra-ui/react';

interface GameInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameInstructions: React.FC<GameInstructionsProps> = ({ isOpen, onClose }) => {
  const textColor = useColorModeValue('gray.700', 'gray.200');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Memory Matrix Game Instructions</ModalHeader>
        <ModalCloseButton />
        <ModalBody color={textColor}>
          <VStack spacing={4} align="start">
            <Text>
              📍 Watch carefully as cells light up in a specific pattern
            </Text>
            <Text>
              🧠 After the pattern disappears, click the cells in the exact same order
            </Text>
            <Text>
              🏆 Each correct sequence increases your score and difficulty
            </Text>
            <Text fontWeight="bold" color="red.500">
              ⚠️ One wrong click ends the game!
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};