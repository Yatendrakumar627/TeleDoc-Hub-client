import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

// Mantine core & extension styles
import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';

// Master Design System & Custom Overrides
import './theme.css';
import './App.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';

const theme = createTheme({
  primaryColor: 'emerald',
  primaryShade: { light: 6, dark: 5 },
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  colors: {
    // 1. Royal Emerald (#185844) - Primary Brand Color
    emerald: [
      '#edf4f0', // 0: ice tint
      '#d7e6dc', // 1: soft tint
      '#b6d3c0', // 2: hairline border
      '#8bb69c', // 3: muted accent
      '#548f6e', // 4: vibrant medium
      '#296e51', // 5: rich deep
      '#185844', // 6: Primary Brand Emerald (#185844)
      '#134737', // 7: Hover
      '#0e3529', // 8: Active
      '#082119', // 9: Deepest
    ],
    // 2. Midnight Forest (#102F27) - Deep Obsidian Contrast
    forest: [
      '#edf3f1',
      '#d4e3de',
      '#b0cac1',
      '#88ada2',
      '#5f8e81',
      '#3b6f62',
      '#225146',
      '#173f36',
      '#102F27', // 8: Midnight Forest (#102F27)
      '#091c17',
    ],
    // 3. Antique Gold (#B08A4F) - Luxury Metallic Accent
    gold: [
      '#fdf9f2', // 0: whisper
      '#f7f0e1',
      '#eedebd', // 2: hairline gold foil
      '#e3cb96',
      '#d5b672',
      '#c49f57',
      '#B08A4F', // 6: Antique Gold (#B08A4F)
      '#9c773e', // 7: Burnished brass
      '#826233',
      '#624823',
    ],
    // 4. Sage (#78947F) - Organic Secondary Tone
    sage: [
      '#f2f6f3',
      '#e2ede5',
      '#c8dcd0',
      '#acc9b7',
      '#91b59f',
      '#78947F', // 5: Sage (#78947F)
      '#647d6a',
      '#516656',
      '#3e4f42',
      '#2c3930',
    ],
    // 5. Ivory (#F2EBDD) - Warm Pearlescent Surface
    ivory: [
      '#faf8f4',
      '#f6f2ea',
      '#F2EBDD', // 2: True Warm Ivory (#F2EBDD)
      '#e5dfd5',
      '#d4cbbe',
      '#beb3a3',
      '#a79b8a',
      '#8d8170',
      '#716656',
      '#544c3f',
    ],
    // Fallback aliases mapped gracefully to palette
    indigo: [
      '#edf4f0',
      '#d7e6dc',
      '#b6d3c0',
      '#8bb69c',
      '#548f6e',
      '#296e51',
      '#185844',
      '#134737',
      '#0e3529',
      '#082119',
    ],
    blue: [
      '#edf4f0',
      '#d7e6dc',
      '#b6d3c0',
      '#8bb69c',
      '#548f6e',
      '#296e51',
      '#185844',
      '#134737',
      '#0e3529',
      '#082119',
    ],
    teal: [
      '#edf4f0',
      '#d7e6dc',
      '#b6d3c0',
      '#8bb69c',
      '#548f6e',
      '#296e51',
      '#185844',
      '#134737',
      '#0e3529',
      '#082119',
    ],
    yellow: [
      '#fdf9f2',
      '#f7f0e1',
      '#eedebd',
      '#e3cb96',
      '#d5b672',
      '#c49f57',
      '#B08A4F',
      '#9c773e',
      '#826233',
      '#624823',
    ],
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
        color: 'emerald',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-right" zIndex={1000} />
      <ErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </MantineProvider>
  </React.StrictMode>
);
