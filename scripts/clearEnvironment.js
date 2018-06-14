// Script to clear environment before starting crawling

"use strict";

const clearRedis = require("./clearRedis");

const clearEnvironment = {
  clear: () => {
    clearRedis.clear();
  }
};

module.exports = clearEnvironment;
