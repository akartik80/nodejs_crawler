// Script to clear redis environment before starting crawling

"use strict";

const redis = require("../lib/redis");

const clearRedis = {
  clear: () => {
    return redis.delAsync('visitedUrls'); // delete set visitedUrls for fresh crawling
  }
};

module.exports = clearRedis;
