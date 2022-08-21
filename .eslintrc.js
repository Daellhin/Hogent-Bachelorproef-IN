module.exports = {
    root: true,
    extends: '@react-native-community',
    rules: {
      'prettier/prettier': 0,
      'curly':  0,
      'comma-dangle': 0,
      '@typescript-eslint/no-unused-vars': 0,
      'react-hooks/exhaustive-deps': 0,
      'react-native/no-inline-styles': 0
    },
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    overrides: [
      {
        files: ['*.ts', '*.tsx'],
        rules: {
          '@typescript-eslint/no-shadow': ['error'],
          'no-shadow': 'off',
          'no-undef': 'off',
        },
      },
    ],
  };
  