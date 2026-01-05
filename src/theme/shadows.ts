/**
 * Shadow System
 * Elevation levels from xs to 2xl with glow effects
 */

export const shadows = {
  // Standard Shadows
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Inner Shadows
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  
  // No Shadow
  none: 'none',
  
  // Glow Effects - Primary (Purple/Pink)
  glowPrimary: {
    xs: '0 0 10px rgba(147, 51, 234, 0.3)',
    sm: '0 0 20px rgba(147, 51, 234, 0.4)',
    md: '0 0 30px rgba(147, 51, 234, 0.5)',
    lg: '0 0 40px rgba(147, 51, 234, 0.6)',
    xl: '0 0 60px rgba(147, 51, 234, 0.7)',
  },
  
  // Glow Effects - Secondary (Pink)
  glowSecondary: {
    xs: '0 0 10px rgba(236, 72, 153, 0.3)',
    sm: '0 0 20px rgba(236, 72, 153, 0.4)',
    md: '0 0 30px rgba(236, 72, 153, 0.5)',
    lg: '0 0 40px rgba(236, 72, 153, 0.6)',
    xl: '0 0 60px rgba(236, 72, 153, 0.7)',
  },
  
  // Glow Effects - Accent (Cyan)
  glowAccent: {
    xs: '0 0 10px rgba(6, 182, 212, 0.3)',
    sm: '0 0 20px rgba(6, 182, 212, 0.4)',
    md: '0 0 30px rgba(6, 182, 212, 0.5)',
    lg: '0 0 40px rgba(6, 182, 212, 0.6)',
    xl: '0 0 60px rgba(6, 182, 212, 0.7)',
  },
  
  // Glow Effects - Success
  glowSuccess: {
    xs: '0 0 10px rgba(34, 197, 94, 0.3)',
    sm: '0 0 20px rgba(34, 197, 94, 0.4)',
    md: '0 0 30px rgba(34, 197, 94, 0.5)',
    lg: '0 0 40px rgba(34, 197, 94, 0.6)',
    xl: '0 0 60px rgba(34, 197, 94, 0.7)',
  },
  
  // Glow Effects - Danger
  glowDanger: {
    xs: '0 0 10px rgba(239, 68, 68, 0.3)',
    sm: '0 0 20px rgba(239, 68, 68, 0.4)',
    md: '0 0 30px rgba(239, 68, 68, 0.5)',
    lg: '0 0 40px rgba(239, 68, 68, 0.6)',
    xl: '0 0 60px rgba(239, 68, 68, 0.7)',
  },
  
  // Combined Shadow + Glow
  elevatedPrimary: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 0 20px rgba(147, 51, 234, 0.3)',
  elevatedSecondary: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 0 20px rgba(236, 72, 153, 0.3)',
  elevatedAccent: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 0 20px rgba(6, 182, 212, 0.3)',
  
  // Dark Mode Shadows (lighter)
  dark: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.6)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
  },
};

// Elevation levels for easy access
export const elevation = {
  0: shadows.none,
  1: shadows.xs,
  2: shadows.sm,
  3: shadows.md,
  4: shadows.lg,
  5: shadows.xl,
  6: shadows['2xl'],
};

export default shadows;
