/**
 * Premium Color Palette
 * Design System - Colors with gradients and semantic meanings
 */

export const colors = {
  // Primary Colors - Purple to Pink gradient
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea', // Main primary
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  
  // Secondary Colors - Pink
  secondary: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899', // Main secondary
    600: '#db2777',
    700: '#be185d',
    800: '#9f1239',
    900: '#831843',
  },
  
  // Accent Colors - Cyan
  accent: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4', // Main accent
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  
  // Success
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Warning
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Error/Danger
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Info
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Neutral/Gray
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Dark Mode Specific
  dark: {
    background: '#0f172a', // slate-900
    card: '#1e293b', // slate-800
    cardHover: '#334155', // slate-700
    border: '#334155',
    text: {
      primary: '#f1f5f9', // slate-100
      secondary: '#cbd5e1', // slate-300
      muted: '#94a3b8', // slate-400
    },
  },
  
  // Light Mode Specific
  light: {
    background: '#ffffff',
    card: '#ffffff',
    cardHover: '#f9fafb',
    border: '#e5e7eb',
    text: {
      primary: '#111827',
      secondary: '#374151',
      muted: '#6b7280',
    },
  },
};

// Gradient Presets
export const gradients = {
  primary: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
  primaryHover: 'linear-gradient(135deg, #7e22ce 0%, #db2777 100%)',
  secondary: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  success: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
  danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  info: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  dark: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  glow: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, rgba(236, 72, 153, 0.1) 100%)',
};

// Semantic Colors
export const semantic = {
  success: colors.success[500],
  warning: colors.warning[500],
  error: colors.danger[500],
  info: colors.info[500],
};

export default colors;
