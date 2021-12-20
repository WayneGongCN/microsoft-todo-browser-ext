module.exports = {
  env: {
    webextensions: true, // https://cn.eslint.org/docs/user-guide/configuring#specifying-environments
    browser: true,
    es2021: true,
  },

  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],

  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },

  plugins: [
    'react',
  ],

  rules: {
    'max-len': ['off', { code: 180 }],
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
  },
};
