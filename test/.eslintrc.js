const path = require('path')

module.exports = {
  root: true,
  extends: [
    'standard-with-typescript'
  ],
  parserOptions: {
    project: 'tsconfig.eslint.json',
    tsconfigRootDir: path.join(__dirname, '..')
  },
  env: {
    mocha: true
  },
  rules: {
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-floating-promises': 'off'
  }
}
