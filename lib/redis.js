// lib for redis

"use strict";

const redis = require("redis");
const Promise = require("bluebird");

const logger = require("./logger");
const config = require("../config");

let options = {};

if (config.redis.host) {
  options.host = config.redis.host;
}

if (config.redis.port) {
  options.port = config.redis.port;
}

if (config.redis.db) {
  options.db = config.redis.db;
}

if (config.redis.password) {
  options.password = config.redis.password;
}

let client;

if (Object.keys(options).length) {
  client = redis.createClient(options);
} else {
  client = redis.createClient();
}

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

client.on('error', err => {
  logger.error(`Error: ${err}`);
});

client.on('connect', () => {
  logger.debug('Connected to redis');
});

module.exports = client;
