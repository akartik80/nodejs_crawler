// library for crawling functions

"use strict";

const async = require("async");
const Promise = require("bluebird");
const config = require("../config");
const rp = require("request-promise");
const requestPromiseErrors = require("request-promise/errors");
const logger = require("./logger");
const getUrls = require("get-urls");
const Url = require("url");
const redis = require("./redis");

const forEachLimit = Promise.promisify(async.forEachLimit);

const crawler = {
  crawl: (urls) => {
    forEachLimit(urls, config.application.parallel_request_limit, (url, cb) => {
      rp(url)
        .then(htmlString => {
          let newUrls = getUrls(htmlString);

          for (let newUrl of newUrls) {
            let urlData = Url.parse(newUrl, true);

            if (urlData.host.match(/medium\.com/g)) {
              console.log(urlData.host);
            }
          }

          logger.debug(`Processed ${url}`);
          cb();
        })
        .catch(requestPromiseErrors.RequestError, err => {
          logger.error(`Error in connection: ${err}`);
        })
        .catch(err => {
          logger.error(`Error: ${err}`);
        });
    }).then(() => {
      logger.debug('Batch processed');
    });
  }
};

module.exports = crawler;
