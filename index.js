// Entry point for app

"use strict";

const crawler = require("./lib/crawler");
const logger = require("./lib/logger");

let argv = process.argv;

if (argv.length < 3) {
  logger.error("Usage: URL='your_url_here' npm start");
  process.exit(0);
}

crawler.crawl([argv[2]]);

// test with random and integer urls
