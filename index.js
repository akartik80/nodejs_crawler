// Entry point for app

"use strict";

const crawler = require("./lib/crawler");
const logger = require("./lib/logger");
const clearEnvironment = require("./scripts/clearEnvironment");

let argv = process.argv;

if (argv.length < 3) {
  logger.error("Usage: URL='your_url_here' npm start");
  process.exit(0);
}

clearEnvironment.clear();
crawler.crawl([argv[2]]);

// test with random and integer urls
