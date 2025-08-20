// ESLint v9 flat config for React with JSX support
import js from '@eslint/js';
import globals from 'globals';

export default [
  // Ignore build artifacts
  {
    ignores: ['node_modules/**', 'build/**', 'dist/**', 'coverage/**'],
  },
  // Base config for all JS/JSX files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
      },
    },
    rules: {
      // Start with ESLint's recommended rules
      ...js.configs.recommended.rules,
      // Keep console logs (important for debug flow)
      'no-console': 'off',
      // Relax unused vars during transition
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Turn off useless escape warnings for regex patterns
      'no-useless-escape': 'off',
      // Allow unreachable code during development
      'no-unreachable': 'warn',
    },
  },
];