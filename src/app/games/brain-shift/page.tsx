'use client'
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Flex, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  useToast,
  Badge,
  List,
  ListItem,
  IconButton,
  Divider,
  Center,
  Card,
  CardBody,
  useColorModeValue,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { FaCheck, FaTimes, FaTrophy, FaInfoCircle, FaBolt, FaQuestionCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { keyframes } from '@emotion/react';

// Type definitions
interface GameResult {
  score: number;
  correctAnswers: number;
  maxStreak: number;
  date: string;
}

// Custom motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const BrainShift = () => {
  // Game state
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [pointValue, setPointValue] = useState<number>(100);
  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [lastScoreAdded, setLastScoreAdded] = useState<number | null>(null);
  
  // Current prompts
  const [currentNumber, setCurrentNumber] = useState<number>(0);
  const [currentLetter, setCurrentLetter] = useState<string>('');
  
  // Refs
  const scoreRef = useRef<HTMLDivElement>(null);
  
  // Modal for instructions
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Animation states
  const [incorrectShake, setIncorrectShake] = useState<boolean>(false);
  const [cardFlip, setCardFlip] = useState<boolean>(false);
  
  const toast = useToast();
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const numberColor = useColorModeValue('blue.600', 'blue.300');
  const letterColor = useColorModeValue('purple.600', 'purple.300');
  const correctColor = useColorModeValue('green.100', 'green.900');
  const incorrectColor = useColorModeValue('red.100', 'red.900');
  
  // Generate random prompts
  const generatePrompts = useCallback(() => {
    setCardFlip(true);
    
    // Slight delay before changing the values for animation effect
    setTimeout(() => {
      // Generate random number between 1 and 100
      setCurrentNumber(Math.floor(Math.random() * 100) + 1);
      
      // Generate random letter (uppercase A-Z)
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      setCurrentLetter(letters.charAt(Math.floor(Math.random() * letters.length)));
      
      setCardFlip(false);
    }, 150);
  }, []);
  
  // Check if number is even
  const isEven = (num: number): boolean => num % 2 === 0;
  
  // Check if letter is vowel
  const isVowel = (letter: string): boolean => ['A', 'E', 'I', 'O', 'U'].includes(letter);
  
  // Decode button choice
  const decodeChoice = (choice: number): [boolean, boolean] => {
    switch(choice) {
      case 0: return [true, true];   // Yes to both
      case 1: return [true, false];  // Number is even, Letter is not vowel
      case 2: return [false, true];  // Number is not even, Letter is vowel
      case 3: return [false, false]; // No to both
      default: return [false, false];
    }
  };
  
  // Handle user response
  const handleResponse = (choice: number) => {
    if (!gameActive) return;
    
    const [isEvenResponse, isVowelResponse] = decodeChoice(choice);
    const numberCorrect = isEvenResponse === isEven(currentNumber);
    const letterCorrect = isVowelResponse === isVowel(currentLetter);
    
    if (numberCorrect && letterCorrect) {
      // Both answers correct
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      setMaxStreak(Math.max(maxStreak, newStreak));
      
      // Calculate point value based on streak
      const streakBonus = Math.floor(newStreak / 4) * 50;
      const newPointValue = 100 + streakBonus;
      setPointValue(newPointValue);
      
      // Update score and correct answers count
      setScore(prevScore => prevScore + newPointValue);
      setLastScoreAdded(newPointValue);
      setCorrectAnswers(prevCorrect => prevCorrect + 1);
      
      // Set feedback
      setAnswerFeedback('correct');
      setTimeout(() => setAnswerFeedback(null), 500);
      
      // Generate new prompts
      generatePrompts();
    } else {
      // At least one answer incorrect
      setIncorrectShake(true);
      setTimeout(() => setIncorrectShake(false), 500);
      
      // Reset streak and point value
      setCurrentStreak(0);
      setPointValue(100);
      
      // Set feedback
      setAnswerFeedback('incorrect');
      setTimeout(() => setAnswerFeedback(null), 500);
    }
  };
  
  // Start the game
  const startGame = () => {
    setGameActive(true);
    setTimeLeft(60);
    setScore(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setCorrectAnswers(0);
    setPointValue(100);
    setShowTutorial(false);
    generatePrompts();
    
    // Initial toast
    toast({
      title: 'Game Started!',
      description: 'You have 60 seconds - focus on accuracy first!',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };
  
  // End the game
  const endGame = useCallback(() => {
    setGameActive(false);
    
    // Save game result to history
    const result: GameResult = {
      score,
      correctAnswers,
      maxStreak,
      date: new Date().toLocaleString(),
    };
    
    const newHistory = [...gameHistory, result].sort((a, b) => b.score - a.score);
    setGameHistory(newHistory);
    
    // Save to localStorage
    try {
      localStorage.setItem('brainShiftHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
    
    // Show end game toast with relevant message based on performance
    let toastMessage = 'You can do better!';
    let toastStatus: 'success' | 'info' | 'warning' = 'info';
    
    if (score > 2000) {
      toastMessage = 'Exceptional performance! Your brain is on fire!';
      toastStatus = 'success';
    } else if (score > 1000) {
      toastMessage = 'Great job! You\'re getting really good at this!';
      toastStatus = 'success';
    }
    
    toast({
      title: `Game Over! Score: ${score}`,
      description: toastMessage,
      status: toastStatus,
      duration: 4000,
      isClosable: true,
    });
  }, [score, correctAnswers, maxStreak, gameHistory, toast]);
  
  // Timer effect
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    
    if (gameActive && timeLeft > 0) {
      timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        
        // Provide encouraging messages at certain times
        if (timeLeft === 30) {
          toast({
            title: 'Halfway there!',
            description: 'Keep up the good work!',
            status: 'info',
            duration: 1000,
            isClosable: true,
          });
        } else if (timeLeft === 10) {
          toast({
            title: 'Final countdown!',
            description: '10 seconds left!',
            status: 'warning',
            duration: 1000,
            isClosable: true,
          });
        }
      }, 1000);
    } else if (gameActive && timeLeft === 0) {
      endGame();
    }
    
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [gameActive, timeLeft, endGame, toast]);
  
  // Load game history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('brainShiftHistory');
      if (savedHistory) {
        setGameHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);
  
  // Animations
  // const shakeAnimation = keyframes`
  //   0% { transform: translateX(0); }
  //   25% { transform: translateX(10px); }
  //   50% { transform: translateX(-10px); }
  //   75% { transform: translateX(10px); }
  //   100% { transform: translateX(0); }
  // `;
  
  const scorePopAnimation = keyframes`
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 1; }
    100% { transform: scale(1); opacity: 0; }
  `;
  
  // Get button style based on choice
  const getButtonStyle = (choice: number) => {
    switch(choice) {
      case 0: return { 
        colorScheme: 'green', 
        icon: <FaCheck />, 
        label: 'Both YES'
      };
      case 1: return { 
        colorScheme: 'blue', 
        icon: <Box position="relative">
          <Text position="absolute" top="-8px" left="0" fontSize="xs">Y</Text>
          <Text position="absolute" bottom="-8px" right="0" fontSize="xs">N</Text>
        </Box>, 
        label: 'Even: YES, Vowel: NO'
      };
      case 2: return { 
        colorScheme: 'orange', 
        icon: <Box position="relative">
          <Text position="absolute" top="-8px" left="0" fontSize="xs">N</Text>
          <Text position="absolute" bottom="-8px" right="0" fontSize="xs">Y</Text>
        </Box>, 
        label: 'Even: NO, Vowel: YES'
      };
      case 3: return { 
        colorScheme: 'red', 
        icon: <FaTimes />, 
        label: 'Both NO'
      };
      default: return { 
        colorScheme: 'gray', 
        icon: <FaQuestionCircle />, 
        label: 'Unknown'
      };
    }
  };
  
  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6}>
        <MotionFlex
          justify="center"
          align="center"
          width="100%"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Heading as="h1" size="xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
            Brain Shift
          </Heading>
        </MotionFlex>
        
        <Text 
          textAlign="center" 
          color="gray.600" 
          fontSize="lg"
          fontStyle="italic"
        >
          Test your cognitive flexibility by responding to two prompts at once!
        </Text>
        
        {!gameActive && (
          <MotionFlex
            direction="column"
            align="center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {showTutorial && (
              <Card 
                mb={6} 
                bg="blue.50" 
                borderRadius="xl" 
                variant="outline" 
                borderColor="blue.200"
                boxShadow="md"
                width="100%"
                maxW="500px"
              >
                <CardBody>
                  <HStack spacing={4}>
                    <Box color="blue.500">
                      <FaInfoCircle size="24px" />
                    </Box>
                    <VStack align="start" spacing={3}>
                      <Text fontWeight="bold" fontSize="lg">How to Play:</Text>
                      <Text>• Determine if the number is even (YES/NO)</Text>
                      <Text>• Determine if the letter is a vowel (YES/NO)</Text>
                      <Text>• Answer both questions with a single button press</Text>
                      <Text>• Build streaks to earn bonus points</Text>
                      <Divider my={2} />
                      <Text fontSize="sm" color="blue.700">
                        <b>Pro Tip:</b> Say the values in your head before responding to improve accuracy!
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            )}
            
            <Button 
              colorScheme="green" 
              size="lg" 
              onClick={startGame} 
              mb={4}
              px={10}
              py={6}
              fontSize="xl"
              boxShadow="lg"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
              _active={{ transform: 'translateY(0)', boxShadow: 'md' }}
              aria-label="Start game"
            >
              Start Game
            </Button>
            
            <Button 
              variant="ghost" 
              colorScheme="blue" 
              leftIcon={<FaInfoCircle />} 
              onClick={onOpen}
              size="sm"
            >
              How to Play
            </Button>
            
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
              <ModalOverlay backdropFilter="blur(2px)" />
              <ModalContent>
                <ModalHeader>How to Play Brain Shift</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                  <VStack align="start" spacing={4}>
                    <Text><b>Goal:</b> Answer as many questions correctly as possible in 60 seconds.</Text>
                    
                    <Text><b>Each card shows:</b></Text>
                    <VStack pl={4} align="start" spacing={2}>
                      <Text>• A number (top) - determine if it&apos;s even</Text>
                      <Text>• A letter (bottom) - determine if it&apos;s a vowel (A, E, I, O, U)</Text>
                    </VStack>
                    
                    <Text><b>Response buttons:</b></Text>
                    <VStack pl={4} align="start" spacing={2}>
                      <HStack>
                        <IconButton
                          size="xs"
                          colorScheme="green"
                          aria-label="Example button"
                          icon={<FaCheck />}
                        />
                        <Text>Both YES (number is even AND letter is vowel)</Text>
                      </HStack>
                      <HStack>
                        <IconButton
                          size="xs"
                          colorScheme="blue"
                          aria-label="Example button"
                          icon={<Text fontSize="xs">Y/N</Text>}
                        />
                        <Text>Number is even, letter is NOT vowel</Text>
                      </HStack>
                      <HStack>
                        <IconButton
                          size="xs"
                          colorScheme="orange"
                          aria-label="Example button"
                          icon={<Text fontSize="xs">N/Y</Text>}
                        />
                        <Text>Number is NOT even, letter IS vowel</Text>
                      </HStack>
                      <HStack>
                        <IconButton
                          size="xs"
                          colorScheme="red"
                          aria-label="Example button"
                          icon={<FaTimes />}
                        />
                        <Text>Both NO (number is NOT even AND letter is NOT vowel)</Text>
                      </HStack>
                    </VStack>
                    
                    <Text><b>Scoring:</b></Text>
                    <VStack pl={4} align="start" spacing={2}>
                      <Text>• Base: 100 points per correct answer</Text>
                      <Text>• Streak bonus: +50 points for every 4 consecutive correct answers</Text>
                      <Text>• Any wrong answer resets your streak</Text>
                    </VStack>
                    
                    <Text fontStyle="italic" color="blue.600">
                      Brain Shift tests your cognitive flexibility - your ability to switch between
                      different mental tasks quickly and accurately!
                    </Text>
                  </VStack>
                </ModalBody>
              </ModalContent>
            </Modal>
          </MotionFlex>
        )}
        
        {gameActive && (
          <VStack spacing={6} width="100%">
            <HStack justify="space-between" width="100%" mb={2}>
              <Badge 
                colorScheme={timeLeft <= 10 ? "red" : "purple"} 
                fontSize="md" 
                p={2} 
                borderRadius="md"
                boxShadow="sm"
                animation={timeLeft <= 10 ? "pulse 1s infinite" : "none"}
              >
                Time: {timeLeft}s
              </Badge>
              
              <Flex position="relative" ref={scoreRef}>
                <Badge 
                  colorScheme="blue" 
                  fontSize="md" 
                  p={2} 
                  borderRadius="md"
                  boxShadow="sm"
                >
                  Score: {score}
                </Badge>
                
                {lastScoreAdded && (
                  <Text
                    position="absolute"
                    top="-20px"
                    left="50%"
                    transform="translateX(-50%)"
                    color="green.500"
                    fontWeight="bold"
                    fontSize="sm"
                    animation={`${scorePopAnimation} 1s ease-out forwards`}
                  >
                    +{lastScoreAdded}
                  </Text>
                )}
              </Flex>
              
              <Badge 
                colorScheme={currentStreak >= 4 ? "orange" : "gray"} 
                fontSize="md" 
                p={2} 
                borderRadius="md"
                boxShadow="sm"
              >
                Streak: {currentStreak} {currentStreak >= 4 && <FaBolt />}
              </Badge>
            </HStack>
            
            <MotionBox
              py={8} 
              px={6} 
              borderRadius="xl" 
              boxShadow="xl" 
              bg={answerFeedback === 'correct' ? correctColor : answerFeedback === 'incorrect' ? incorrectColor : cardBg} 
              width="100%"
              maxW="400px"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                rotateY: cardFlip ? 90 : 0,
                x: incorrectShake ? [0, 10, -10, 10, 0] : 0
              }}
              transition={{ 
                duration: 0.3,
                x: { duration: 0.4, ease: "easeInOut" }
              }}
            >
              <VStack spacing={8}>
                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.500" mb={2} fontWeight="medium">
                    Is this number EVEN?
                  </Text>
                  <Heading 
                    size="2xl" 
                    color={numberColor}
                    textShadow="0px 2px 4px rgba(0,0,0,0.1)"
                    fontFamily="monospace"
                  >
                    {currentNumber}
                  </Heading>
                </Box>
                
                <Divider borderWidth="1px" borderColor="gray.300" />
                
                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.500" mb={2} fontWeight="medium">
                    Is this letter a VOWEL?
                  </Text>
                  <Heading 
                    size="2xl" 
                    color={letterColor}
                    textShadow="0px 2px 4px rgba(0,0,0,0.1)"
                    fontFamily="monospace"
                  >
                    {currentLetter}
                  </Heading>
                </Box>
              </VStack>
            </MotionBox>
            
            <HStack spacing={4} mt={4} justify="center">
              {[0, 1, 2, 3].map((choice) => {
                const { colorScheme, icon, label } = getButtonStyle(choice);
                return (
                  <Tooltip key={choice} label={label} hasArrow placement="top">
                    <IconButton
                      colorScheme={colorScheme}
                      size="lg"
                      icon={icon}
                      onClick={() => handleResponse(choice)}
                      aria-label={label}
                      boxShadow="md"
                      fontSize="xl"
                      height="60px"
                      width="60px"
                      borderRadius="xl"
                      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                      _active={{ transform: 'translateY(0)', boxShadow: 'sm' }}
                    />
                  </Tooltip>
                );
              })}
            </HStack>
            
            <Text 
              fontSize="sm" 
              mt={2} 
              color={currentStreak >= 4 ? "orange.500" : "gray.600"}
              fontWeight={currentStreak >= 4 ? "bold" : "normal"}
            >
              Each correct answer: {pointValue} points
              {currentStreak >= 4 && ` (${Math.floor(currentStreak / 4) * 50} point bonus active!)`}
            </Text>
          </VStack>
        )}
        
        {gameHistory.length > 0 && (
          <MotionBox 
            width="100%" 
            mt={8}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Heading as="h2" size="md" mb={4} display="flex" alignItems="center">
              <FaTrophy color="gold" style={{ marginRight: '8px' }} /> Game History
            </Heading>
            
            <List spacing={3} width="100%">
              {gameHistory.slice(0, 5).map((result, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <ListItem 
                    p={4} 
                    borderRadius="lg" 
                    bg={index === 0 ? 'yellow.50' : 'gray.50'}
                    borderLeft={index === 0 ? '4px solid gold' : '4px solid transparent'}
                    boxShadow="md"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.2s"
                  >
                    <Flex justify="space-between" align="center">
                      <HStack>
                        {index === 0 && <FaTrophy color="gold" size="20px" />}
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold">Score: {result.score}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {result.correctAnswers} correct answers | Max streak: {result.maxStreak}
                          </Text>
                        </VStack>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">{result.date}</Text>
                    </Flex>
                  </ListItem>
                </MotionBox>
              ))}
            </List>
            
            {gameHistory.length > 5 && (
              <Center mt={2}>
                <Text fontSize="sm" color="gray.500">
                  Showing the top 5 of {gameHistory.length} results
                </Text>
              </Center>
            )}
          </MotionBox>
        )}
      </VStack>
    </Container>
  );
};

export default BrainShift;