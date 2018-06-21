// library for crawling functions

"use strict";

const async = require("./async");
const request = require("request");
const getUrls = require("get-urls");
const Url = require("url");
const hstore = require('pg-hstore')();

const config = require("../config");
const logger = require("./logger");
const redis = require("./redis");
const knex = require("./knex");

const REDIS_PARALLEL_REQUESTS_LIMIT = 10;

const crawler = {
  crawl: (urls, crawlCallback) => {
    let urlsForNextCrawl = [];

    async.forEachLimit(urls, config.application.parallelRequestLimit, (url, cb) => {
      url = crawler.trimSlash(url);
      logger.debug(`Crawling ${url}`);

      redis.sadd('visitedUrls', url, (err, added) => {
        if (err) {
          logger.error('Unable to add in redis set. Exiting to avoid infinite calls');
          cb(err);
        } else if (added) { // if added is 1 then only proceed. Else this url is already parsed by a parallel request
          request(url, {
            follow_redirect: false
          }, (err, response, body) => {
            if (err) {
              logger.error(`Error: ${err}`);
              cb(); // we don't want to stop crawling in case of error in one request
            } else {
              let currentUrlData = Url.parse(url, true);

              // save data and continue crawling in parallel
              let tasks = [
                parallelTasksCallback => {
                  crawler.saveData(currentUrlData, err => {
                    if (err) {
                      logger.error(`Error in saving data for ${url}. Error: ${err}`);
                    }

                    parallelTasksCallback(); // continue in case of error in saving data for a URL
                  });
                },

                parallelTasksCallback => {
                  let newUrls = null;

                  try {
                    newUrls = getUrls(body);
                  } catch (err) {
                    logger.error(`Error: ${err}`);
                  }

                  if (newUrls) {
                    async.forEachLimit(newUrls, REDIS_PARALLEL_REQUESTS_LIMIT, (newUrl, callback) => {
                      let urlData = Url.parse(newUrl, true);
                      urlData.href = crawler.trimSlash(urlData.href);

                      // crawl current website only. skip audio, image urls
                      if (urlData.host.match(config.application.matcherRegex) && !urlData.href.match(/\.m4a$|\.jpg$|\.jpeg$|\.png$/)) {
                        redis.sismemberAsync('visitedUrls', urlData.href)
                          .then(isMember => {
                            if (!isMember) {
                              urlsForNextCrawl.push(urlData.href);
                            } else {
                              logger.debug(`Skipping already crawled URL: ${urlData.href}`);
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
                    }, err => {
                      if (err) {
                        parallelTasksCallback(err);
                      } else {
                        logger.debug(`Processed ${url}`);
                        parallelTasksCallback();
                      }
                    });
                  } else {
                    parallelTasksCallback();
                  }
                }
              ];

              async.parallel(tasks, err => {
                if (err) {
                  logger.error(`Error: ${err}`);
                }

                cb();
              });
            }
          });
        } else {
          cb();
        }
      });
    }, err => {
      if (err) {
        logger.error(`Error: ${err}`);
        crawlCallback(err);
      } else {
        logger.debug('Batch processed');

        if (urlsForNextCrawl.length) {
          crawler.crawl(urlsForNextCrawl, crawlCallback); // recursively crawl further
        } else {
          crawlCallback();
        }
      }
    });
  },

  trimSlash: (url) => {
    // https://medium.com and https://medium.com/ are same
    if (url.match(config.application.tld.match)) {
      return url.replace(config.application.tld.find, config.application.tld.replace);
    }

    return url;
  },

  saveData: (data, cb) => {
    knex('crawl_data')
      .select('*')
      .where({
        path: data.pathname
      })
      .then(rows => {
        if (rows && rows.length) { // found
          crawler.update(data, cb);
        } else { // not found
          crawler.insert(data, cb);
        }
      })
      .catch(err => {
        logger.error(`Error in reading from psql. Error: ${err}, ${data.pathname}`);
        cb()
      });
  },

  insert: (data, cb) => {
    knex('crawl_data') // insert
      .insert({
        host: data.host,
        path: data.pathname,
        params: hstore.stringify(data.query), // we don't care about param values
        reference_count: 1
      })
      .then(() => {
        logger.debug(`Successfully inserted path: ${data.pathname}`);
        cb();
      })
      .catch(err => {
        logger.debug(`Unable to insert. Error: ${err}. Insertion could be performed by a parallel request. Trying updation`);
        crawler.update(data, cb);
      })
  },

  update: (data, cb) => {
    knex.raw('update crawl_data set reference_count = reference_count + 1, params = params || ?::hstore where path = ?',
      [hstore.stringify(data.query), data.pathname])
      .then(() => {
        logger.debug(`Successfully updated path: ${data.pathname}`);
        cb();
      })
      .catch(err => {
        logger.error(`Error in updation. Error: ${err}`);
        cb(err);
      })
  }
};

module.exports = crawler;
