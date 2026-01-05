/**
 * Spacing System
 * 4px base scale from 0 to 24
 */

// Base unit: 4px
const BASE_UNIT = 4;

// Spacing scale (0-24)
export const spacing = {
  0: '0',
  1: `${BASE_UNIT * 1}px`,   // 4px
  2: `${BASE_UNIT * 2}px`,   // 8px
  3: `${BASE_UNIT * 3}px`,   // 12px
  4: `${BASE_UNIT * 4}px`,   // 16px
  5: `${BASE_UNIT * 5}px`,   // 20px
  6: `${BASE_UNIT * 6}px`,   // 24px
  7: `${BASE_UNIT * 7}px`,   // 28px
  8: `${BASE_UNIT * 8}px`,   // 32px
  9: `${BASE_UNIT * 9}px`,   // 36px
  10: `${BASE_UNIT * 10}px`, // 40px
  11: `${BASE_UNIT * 11}px`, // 44px
  12: `${BASE_UNIT * 12}px`, // 48px
  14: `${BASE_UNIT * 14}px`, // 56px
  16: `${BASE_UNIT * 16}px`, // 64px
  20: `${BASE_UNIT * 20}px`, // 80px
  24: `${BASE_UNIT * 24}px`, // 96px
};

// Semantic spacing
export const semanticSpacing = {
  // Padding
  padding: {
    xs: spacing[2],    // 8px
    sm: spacing[3],    // 12px
    md: spacing[4],    // 16px
    lg: spacing[6],    // 24px
    xl: spacing[8],    // 32px
    '2xl': spacing[12], // 48px
  },
  
  // Margin
  margin: {
    xs: spacing[2],    // 8px
    sm: spacing[3],    // 12px
    md: spacing[4],    // 16px
    lg: spacing[6],    // 24px
    xl: spacing[8],    // 32px
    '2xl': spacing[12], // 48px
  },
  
  // Gap (for flex/grid)
  gap: {
    xs: spacing[1],    // 4px
    sm: spacing[2],    // 8px
    md: spacing[4],    // 16px
    lg: spacing[6],    // 24px
    xl: spacing[8],    // 32px
  },
  
  // Section spacing
  section: {
    xs: spacing[8],    // 32px
    sm: spacing[12],   // 48px
    md: spacing[16],   // 64px
    lg: spacing[20],   // 80px
    xl: spacing[24],   // 96px
  },
};

export default spacing;
