// Script to clear psql environment before starting crawling

"use strict";

const knex = require("../lib/knex");

const clearPsql = {
  clear: () => {
    return knex('crawl_data').del();
  }
};

module.exports = clearPsql;
