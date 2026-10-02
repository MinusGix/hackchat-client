module.exports = {
  collectCoverageFrom: [
    'app/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  moduleDirectories: ['node_modules', 'app'],
  moduleNameMapper: {
    '.*\\.(css|less|styl|scss|sass)$': '<rootDir>/internals/mocks/cssModule.js',
    // extensionless CSS entry points exposed via package.json "exports"
    '^react-color-palette/css$': '<rootDir>/internals/mocks/cssModule.js',
    // jsdom resolves the "browser" export condition, which for uuid is
    // ESM-only (pulled in via @solana/web3.js -> jayson); use the CJS build
    '^uuid$': require.resolve('uuid'),
    '.*\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/internals/mocks/image.js',
  },
  setupFilesAfterEnv: ['<rootDir>/internals/testing/test-bundler.js'],
  setupFiles: ['raf/polyfill'],
  testEnvironment: 'jsdom',
  testRegex: 'tests/.*\\.test\\.js$',
  snapshotSerializers: [],
};
