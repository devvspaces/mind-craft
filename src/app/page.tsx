"use client";

import React from "react";
import {
  VStack,
  Heading,
  Text,
  Container,
  useColorModeValue,
  SimpleGrid,
  Image,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");

  const games = [
    {
      title: "Memory Matrix",
      details: "Test and improve your memory by remembering complex patterns",
      route: "/games/memory-matrix",
      img: "https://play-lh.googleusercontent.com/Qk8R_kgm6N_nefK6cmA7GRa5OogmSZ4R_xjPdOXXzEC9uGOW9Y86NaGxqYIuDoTVMw",
    },
    {
      title: "Sudoku's Revenge",
      details:
        "Test and improve your logical thinking by solving Sudoku puzzles",
      route: "/games/sudoku",
      img: "https://play-lh.googleusercontent.com/dWJhAOii4Hh3HqqWbbkWm9qNweIKyj-zyqqu7gIYDqsqwH9NdtQohu7RbpvI62Ht3Q=w240-h480-rw",
    },
    {
      title: "Mind Over Hue",
      details:
        "Outsmart your brain in a fast-paced battle of colors and cognition.",
      route: "/games/mind-over-hue",
      img: "https://f.hubspotusercontent30.net/hubfs/4749288/Depositphotos_82012972_l-2015-1080x675.jpg",
    },
    {
      title: "Flash Compare",
      details:
        "Fast-paced challenge where you quickly decide if each flashcard symbol matches the one that came before it.",
      route: "/games/flash-compare",
      img: "https://static.vecteezy.com/system/resources/previews/020/096/630/non_2x/cartoon-high-level-icon-in-comic-style-speedometer-tachometer-sign-illustration-pictogram-risk-meter-splash-business-concept-vector.jpg",
    },
  ];

  return (
    <Container maxW="container.xl" centerContent height="100vh">
      <SimpleGrid pb={10} columns={{
        base: 1,
        sm: 2,
        md: 2,
        lg: 3,
        xl: 3,
      }} spacing={10}>
        {games.map((game, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <VStack
              key={index}
              spacing={3}
              textAlign="center"
              bg={bgColor}
              p={10}
              borderRadius="xl"
              boxShadow="xl"
              onClick={() => router.push(game.route)}
              cursor="pointer"
            >
              <Image
                src={game.img}
                alt={game.title}
                boxSize="100px"
                objectFit="cover"
                borderRadius="full"
                mb={2}
                width={"60px"}
                height={"60px"}
              />
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Heading size="md" color={textColor}>
                  {game.title}
                </Heading>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Text fontSize={"sm"} color="gray.500">
                  {game.details}
                </Text>
              </motion.div>
            </VStack>
          </motion.div>
        ))}
      </SimpleGrid>
    </Container>
  );
}
