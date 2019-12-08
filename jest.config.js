module.exports = {
  roots: [
    "<rootDir>/src"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["html"],
  collectCoverageFrom: [
    "src/**/*.ts"
  ],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
}