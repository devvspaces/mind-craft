import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        minH: '100vh',
        color: "gray.800",
      },
    },
  },
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      variants: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        solid: (props: any) => ({
          bg: props.colorScheme === 'blue' ? 'brand.500' : undefined,
          _hover: {
            bg: props.colorScheme === 'blue' ? 'brand.600' : undefined,
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
          transition: 'all 0.2s ease-in-out',
        }),
      },
    },
    Container: {
      baseStyle: {
        maxW: 'container.lg',
        px: { base: 4, md: 6 },
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme;