const js = require('@eslint/js');
const globals = require('globals');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const reactPlugin = require('eslint-plugin-react');

/**
 * ESLint Flat Config (ESLint v9+)
 */
module.exports = [
  // Ignorar salidas y dependencias
  {
    ignores: ['dist/**', 'node_modules/**']
  },

  // Reglas base recomendadas para JS
  {
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
      },
    },
  },

  // Reglas para TypeScript/TSX
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        // Para lint sin type-check; si quieres type-aware, se puede activar projectService
        // projectService: true,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
    },
    rules: {
      // Reglas recomendadas de TS y React
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  // Archivos CJS puntuales (configs)
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'script',
      globals: { ...globals.node },
    },
  },
];
