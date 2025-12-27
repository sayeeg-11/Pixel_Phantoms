export default [
  {
    ignores: ['node_modules/**', '**/*.min.js', 'vendor/**', 'dist/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      eqeqeq: 'warn',
    },
  },
];
