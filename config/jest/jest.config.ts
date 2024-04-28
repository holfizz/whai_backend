export default {
  clearMocks: true,
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["\\\\node_modules\\\\"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
  moduleDirectories: ["node_modules"],
  modulePaths: ["<rootDir>src"],
  testMatch: ["<rootDir>/src/**/*(*.)@(spec|test).[tj]s?(x)"],
  rootDir: "../../",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  preset: "ts-jest",
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath: "<rootDir>/reports/unit",
        filename: "report.html",
        openReport: false,
      },
    ],
  ],
};
