// lib for redis

"use strict";

const redis = require("redis");
const logger = require("./logger");

const client = redis.createClient();

client.on('error', err => {
  logger.error(`Error: ${err}`);
});

module.exports = client;
