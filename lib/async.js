// lib file for async

"use strict";

const logger = require("./logger");

const async = {
  parallel: (tasks, cb) => {
    let noOfCallbacks = 0;
    let error = false;

    if (tasks && tasks.length) {
      tasks.forEach(task => {
        setImmediate(() => { // delegate to task queue
          task(err => {
            if (err) {
              error = true;
              cb(err);
            }

            if (!error) {
              noOfCallbacks++;

              if (noOfCallbacks === tasks.length) {
                cb();
              }
            }
          });
        });
      });
    } else {
      cb();
    }
  },

  forEachLimit: (iterable, limit, eachFunction, cb) => {
    let array = [...iterable];
    let noOfCallbacks = 0;
    let curPoolSize = 0;
    let index = 0; // denotes current element for which eachFunction is to be executed
    let forwardIndex = 0; // denotes index for which setImmediate is to be called
    let error = false;

    let helper = callback => {
      if (index === array.length) {
        return;
      }

      while (curPoolSize < limit && forwardIndex < array.length) {
        curPoolSize++;
        forwardIndex++;

        setImmediate(() => {
          eachFunction(array[index], err => {
            if (err) {
              error = true;
              callback(err);
            } else if (!error) {
              curPoolSize--;
              noOfCallbacks++;
              helper(callback);

              if (noOfCallbacks === array.length) {
                callback();
              }
            }
          });

          index++;
        });
      }
    };

    if (array.length === 0) {
      cb();
    } else {
      helper(cb);
    }
  }
};

module.exports = async;
