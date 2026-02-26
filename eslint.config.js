import js from '@eslint/js';
import pluginQuery from '@tanstack/eslint-plugin-query';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'src/components/ui'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, ...pluginQuery.configs['flat/recommended']],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-console': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      // TanStack Query best practices
      '@tanstack/query/exhaustive-deps': 'error',
      '@tanstack/query/no-rest-destructuring': 'warn',
      // Prevent client-side data processing in business logic (but allow UI rendering)
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'CallExpression[callee.property.name="filter"][callee.object.name="data"]',
          message: 'Consider using server-side filtering for large datasets.',
        },
        {
          selector: 'CallExpression[callee.property.name="slice"][callee.object.name="data"]',
          message: 'Consider using server-side pagination for large datasets.',
        },
      ],
      // Prevent mock imports and usage
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/mocks/**', '**/mock*', '**/*.mock.*'],
              message: 'Mock imports are not allowed. Use real Firebase data instead.',
            },
            {
              group: ['msw', 'miragejs', 'json-server', 'faker', '@faker-js/faker', 'chance', 'test-data-bot'],
              message: 'Mock libraries are not allowed. Use real Firebase data instead.',
            },
          ],
        },
      ],
    },
  }
);
