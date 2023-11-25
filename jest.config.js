module.exports = {
  roots: [
    "<rootDir>/src"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["html", "json"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!**/*/index.ts",
    "!src/broadcast/*", // Remove these lines later
    "!src/chrome/*",
    "!src/iframe/*",
    "!src/worker/*",
  ],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {tsconfig: './tsconfig.spec.json'}]
  }
}