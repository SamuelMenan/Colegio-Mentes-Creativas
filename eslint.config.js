module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'react'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['dist/', 'node_modules/'],
  overrides: [
    {
      files: ['*.cjs'],
      parserOptions: { sourceType: 'script' },
      env: { node: true },
    },
    {
      files: ['*.config.js', '*.js'],
      parserOptions: { sourceType: 'module' },
      env: { node: true },
    },
  ],
};
