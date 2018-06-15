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

clearEnvironment.clear()
  .then(() => {
    logger.info('Successfully cleared environment');

    crawler.crawl([argv[2]], err => {
      if (err) {
        logger.info('Crawling complete with errors');
      } else {
        logger.info('Crawling successfully completed');
      }
    });
  })
  .catch(err => {
    logger.error(`Error in clearing environment: ${err}`);
  });

// test for json
