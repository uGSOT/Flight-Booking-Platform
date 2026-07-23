// Jest config. Uses an inline babel-jest transform (no root babel config) so the
// Vite build is unaffected. Coverage targets the pure logic layer.
module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.js"],
  transform: {
    "^.+\\.[jt]sx?$": [
      "babel-jest",
      {
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          ["@babel/preset-react", { runtime: "automatic" }],
        ],
      },
    ],
  },
  collectCoverageFrom: [
    "src/lib/format.js",
    "src/lib/mockFlights.js",
    "src/lib/fares.js",
    "src/lib/analytics.js",
    "src/lib/toast.js",
    "src/lib/bookingsStore.js",
    "src/lib/profileStore.js",
    "src/data/airports.js",
  ],
  coverageThreshold: {
    global: { branches: 98, functions: 98, lines: 98, statements: 98 },
  },
};
