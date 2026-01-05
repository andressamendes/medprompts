/**
 * Design System
 * Centralized exports for all theme tokens
 */

export { colors, gradients, semantic } from './colors';
export { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, typography } from './typography';
export { shadows, elevation } from './shadows';
export { spacing, semanticSpacing } from './spacing';

// Border Radius System
export const borderRadius = {
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
};

// Z-Index Scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
};

// Transition Durations
export const transition = {
  fastest: '100ms',
  fast: '200ms',
  normal: '300ms',
  slow: '500ms',
  slowest: '700ms',
};

// Breakpoints (for reference)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Export as default theme object
const theme = {
  colors: require('./colors').colors,
  gradients: require('./colors').gradients,
  semantic: require('./colors').semantic,
  typography: require('./typography').typography,
  fontFamily: require('./typography').fontFamily,
  fontSize: require('./typography').fontSize,
  fontWeight: require('./typography').fontWeight,
  lineHeight: require('./typography').lineHeight,
  letterSpacing: require('./typography').letterSpacing,
  shadows: require('./shadows').shadows,
  elevation: require('./shadows').elevation,
  spacing: require('./spacing').spacing,
  semanticSpacing: require('./spacing').semanticSpacing,
  borderRadius,
  zIndex,
  transition,
  breakpoints,
};

export default theme;
