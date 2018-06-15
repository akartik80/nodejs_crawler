// Script to clear environment before starting crawling

"use strict";

const clearRedis = require("./clearRedis");
const clearPsql = require("./clearPsql");
const async = require("../lib/async");
const logger = require("../lib/logger");

const clearEnvironment = {
  clear: () => {
    let tasks = [
      callback => {
        clearRedis.clear()
          .then(() => {
            logger.info('Successfully cleared redis');
            callback();
          })
          .catch(err => {
            logger.error(`Error in clearing redis. Error: ${err}`);
            callback(err);
          })
      },

      callback => {
        clearPsql.clear()
          .then(() => {
            logger.info('Successfully cleared psql');
            callback();
          })
          .catch(err => {
            logger.error(`Error in clearing psql. Error: ${err}`);
            callback(err);
          })
      }
    ];

    return async.parallelAsync(tasks);
  }
};

module.exports = clearEnvironment;
