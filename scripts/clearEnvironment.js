// Script to clear environment before starting crawling

"use strict";

const Promise = require("bluebird");

const clearRedis = require("./clearRedis");
const clearPsql = require("./clearPsql");

const clearEnvironment = {
  clear: () => {
    return Promise.all([clearRedis.clear(), clearPsql.clear()])
  }
};

module.exports = clearEnvironment;
