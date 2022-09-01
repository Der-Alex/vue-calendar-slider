/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  env: {
    amd: true,
    browser: true,
    node: true
  },
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
};
