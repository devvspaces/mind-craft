// components/Celebration.js
import { useEffect, useState } from "react";
import { Box, Text } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { formatTime } from "@/lib/time";

const Celebration = ({
  isVisible,
  timeTaken,
  gridSize,
}: {
  isVisible: boolean;
  timeTaken: number;
  gridSize: number;
}) => {
  const [confettiTriggered, setConfettiTriggered] = useState(false);

  useEffect(() => {
    if (isVisible && !confettiTriggered) {
      // Trigger confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const confettiInterval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(confettiInterval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        // Launch confetti from both sides
        confetti({
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFBE0B", "#FD5200"],
        });

        confetti({
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFBE0B", "#FD5200"],
        });
      }, 250);

      setConfettiTriggered(true);

      return () => {
        clearInterval(confettiInterval);
      };
    }
  }, [isVisible, confettiTriggered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="1000"
          pointerEvents="none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              bg="rgba(255, 255, 255, 0.9)"
              borderRadius="lg"
              p={8}
              textAlign="center"
              boxShadow="xl"
              maxW="500px"
            >
              <motion.h2
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: 2,
                  ease: "easeInOut",
                }}
              >
                <Text fontSize="4xl" fontWeight="bold" mb={4} color="green.500">
                  Puzzle Solved!
                </Text>
              </motion.h2>
              <Text fontSize="xl" mb={3}>
                Congratulations! You&apos;ve completed the {gridSize}×{gridSize}{" "}
                puzzle.
              </Text>
              <Text color="gray.600">Time taken: {formatTime(timeTaken)}</Text>
            </Box>
          </motion.div>
        </Box>
      )}
    </AnimatePresence>
  );
};
export default Celebration;
