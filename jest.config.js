export default {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  moduleNameMapper: {
    "\\.(css|less|scss)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "jest-transform-stub",
  },
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  testMatch: ["<rootDir>/src/**/__tests__/**/*.{js,jsx}", "<rootDir>/src/**/*.(test|spec).{js,jsx}"],
  moduleFileExtensions: ["js", "jsx", "json"],
  transformIgnorePatterns: ["node_modules/(?!(react-select)/)"],
  collectCoverageFrom: ["src/**/*.{js,jsx}", "!src/index.js", "!src/main.jsx"],
  extensionsToTreatAsEsm: ['.jsx'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};
