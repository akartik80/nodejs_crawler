// Script to clear redis environment before starting crawling

"use strict";

const redis = require("../lib/redis");
const logger = require("../lib/logger");

const clearRedis = {
  clear: () => {
    redis.flushdbAsync()
      .then(() => {
        logger.debug('Successfully cleared redis DB');
      })
      .catch(err => {
        logger.error(`Error in clearing redis DB`);
        process.exit(0);
      });
  }
};

module.exports = clearRedis;
