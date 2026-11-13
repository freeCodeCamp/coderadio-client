import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist', 'cypress/videos', 'cypress/screenshots'] },
  js.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } }
    }
  },
  {
    files: ['src/**/*.test.{js,jsx}', 'src/test/**'],
    languageOptions: { globals: { ...globals.node } }
  },
  {
    files: ['cypress/**', '*.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
        cy: 'readonly',
        expect: 'readonly'
      }
    }
  },
  prettier
];
