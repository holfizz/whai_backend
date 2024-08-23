class logger {
  log(...props) {
    if (process.env.NODE_ENV === "development") {
      console.log(...props);
    }
  }
  error(...props) {
    if (process.env.NODE_ENV === "development") {
      console.error(...props);
    }
  }
  warn(...props) {
    if (process.env.NODE_ENV === "development") {
      console.warn(...props);
    }
  }
}
export default new logger();
