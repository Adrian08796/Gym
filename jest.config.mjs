export default {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest-setup.js'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-react'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios)/'
  ],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  globals: {
    'import.meta': {
      env: {
        VITE_BACKEND_HOST: 'http://localhost:4500/api'
      }
    }
  },
};