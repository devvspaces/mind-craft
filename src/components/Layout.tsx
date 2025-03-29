"use client";

import React from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  IconButton,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { FiHome } from "react-icons/fi";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

export default function LayoutComponent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDarkMode = colorMode === "dark";
  const navBg = useColorModeValue("gray.700", "gray.900");
  const textColor = useColorModeValue("white", "brand.200");
  const mainBg = useColorModeValue("white", "gray.700");
  return (
    <Box>
      <Box boxShadow="md" bg={navBg} as="nav">
        <Container maxW="1200px" mx="auto" p={0}>
          {/* Navbar */}
          <Flex
            align="center"
            justify="space-between"
            padding="1.5rem"
            color="white"
          >
            <Heading as="h1" size="lg" color={textColor}>
              <NextLink href="/" passHref>
              MindCraft
              </NextLink>
            </Heading>
            <Flex align="center" gap={4}>
              <NextLink href="/" passHref>
                <IconButton icon={<FiHome />} aria-label="Home" />
              </NextLink>
              <IconButton
                icon={isDarkMode ? <SunIcon /> : <MoonIcon />}
                aria-label="Toggle dark mode"
                onClick={toggleColorMode}
              />
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Main content */}
      <Box bg={mainBg} py={4} minH="calc(100vh - 64px)">
        <Container maxW="1200px" mx="auto" p={4}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
