// library for winston logger

const winston = require("winston");
const config = require("../config");

const logger = winston.createLogger({
  level: config.winston.level,
  format: winston.format.json()
});

module.exports = logger;
