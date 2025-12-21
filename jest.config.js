module.exports = {
  testEnvironment: "node",
  testMatch: ["**/test/**/*.test.js"],
  collectCoverage: true,
  collectCoverageFrom: [
    "utils/XavierUtil.js"
    // "index.js"
  ],
  coverageDirectory: "coverage/backend",
  coverageReporters: ["text", "html"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
