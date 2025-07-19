const morgan = require("morgan");
const config = require("./config");
const eventEmitter = require("../utils/logging");

// Add custom token for optional error messages
morgan.token("message", (req, res) => res.locals.errorMessage || "");

// Choose IP format for production/dev
const getIpFormat = () => (config.env === "production" ? ":remote-addr - " : "");

// Define formats
const successFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

const successHandler = morgan(successFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: {
    write: (message) => eventEmitter.emit("logging", message.trim())
  }
});

const errorHandler = morgan(errorFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: {
    write: (message) => eventEmitter.emit("logging", message.trim())
  }
});

module.exports = {
  successHandler,
  errorHandler
};
