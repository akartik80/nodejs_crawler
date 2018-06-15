// library for crawling functions

"use strict";

const async = require("async");
const Promise = require("bluebird");
const requestPromise = require("request-promise");
const requestPromiseErrors = require("request-promise/errors");
const getUrls = require("get-urls");
const Url = require("url");

const config = require("../config");
const logger = require("./logger");
const redis = require("./redis");

Promise.promisifyAll(async);

const REDIS_PARALLEL_REQUESTS_LIMIT = 10;

const crawler = {
  crawl: (urls, crawlCallback) => {
    let urlsForNextCrawl = [];

    async.forEachLimitAsync(urls, config.application.parallelRequestLimit, (url, cb) => {
      url = crawler.trimSlash(url);

      logger.debug(`Crawling ${url}`);

      redis.saddAsync('visitedUrls', url)
        .then(() => {
          requestPromise(url, {
            follow_redirect: false
          }).then(htmlString => {
            let newUrls = getUrls(htmlString);

            async.forEachLimitAsync(newUrls, REDIS_PARALLEL_REQUESTS_LIMIT, (newUrl, callback) => {
              let urlData = Url.parse(newUrl, true);
              urlData.href = crawler.trimSlash(urlData.href);

              // crawl medium website only. skip audio, image urls
              if (urlData.host.match(config.application.matcherRegex) && !urlData.href.match(/\.m4a$|\.jpg$|\.jpeg$|\.png$/)) {
                redis.sismemberAsync('visitedUrls', urlData.href)
                  .then(isMember => {
                    if (!isMember) {
                      urlsForNextCrawl.push(urlData.href);
                    }

                    callback();
                  })
                  .catch(err => {
                    logger.error('Unable to read from redis set. Exiting to avoid infinite calls');
                    callback(err);
                  });
              } else {
                callback();
              }
            })
            .then(() => {
              logger.debug(`Processed ${url}`);
              cb();
            })
            .catch(err => {
              cb(err);
            });
          })
          .catch(requestPromiseErrors.RequestError, err => {
            logger.error(`Error in connecting. Either URL is invalid or your internet connection is down. Error: ${err}`);
            cb(); // we don't want to stop crawling in case of error in one request
          })
          .catch(err => {
            logger.error(`Error: ${err}`);
            cb(); // we don't want to stop crawling in case of error in one request
          });
        })
        .catch(err => {
          logger.error('Unable to add in redis set. Exiting to avoid infinite calls');
          cb(err);
        });
    }).then(() => {
      logger.debug('Batch processed');

      if (urlsForNextCrawl.length) {
        crawler.crawl(urlsForNextCrawl, crawlCallback); // recursively crawl further
      } else {
        crawlCallback();
      }
    }).catch((err) => {
      crawlCallback(err);
    });
  },

  trimSlash: (url) => {
    if (url[url.length - 1] === '/') { // https://medium.com and https://medium.com/ are same
      return url.substring(0, url.length - 1);
    }

    return url;
  }
};

module.exports = crawler;
