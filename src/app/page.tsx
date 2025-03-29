'use client';

import React from 'react';
import { 
  VStack, 
  Heading, 
  Text, 
  Button, 
  Container,
  useColorModeValue
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  return (
    <Container maxW="container.md" centerContent height="100vh" display="flex" justifyContent="center">
      <VStack 
        spacing={8} 
        textAlign="center" 
        bg={bgColor} 
        p={10} 
        borderRadius="xl" 
        boxShadow="xl"
      >
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Heading size="2xl" color={textColor}>
            Brain Training
          </Heading>
          <Text color={textColor} mt={4} fontSize="xl">
            Challenge Your Memory Skills
          </Text>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button 
            colorScheme="blue" 
            size="lg" 
            onClick={() => router.push('/game')}
            p={6}
            fontSize="xl"
          >
            Play Memory Matrix
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Text color="gray.500" mt={4}>
            Test and improve your memory by remembering complex patterns
          </Text>
        </motion.div>
      </VStack>
    </Container>
  );
}