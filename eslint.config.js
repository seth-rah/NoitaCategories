import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  includeIgnoreFile(fileURLToPath(new URL('.gitignore', import.meta.url))),
  js.configs.recommended,
  {
    files: ['site/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['test/**/*.js', '*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: 'error',
      curly: 'error',
      'no-implicit-coercion': 'error',
      'object-shorthand': 'error',
    },
  },
]);
