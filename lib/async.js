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
    let breakArray = array => {
      let finalArray = [];
      let tempArray = [];

      array.forEach((element, index) => {
        if (index !== 0 && index % 5 === 0) {
          finalArray.push(tempArray);
          tempArray = [];
        }

        tempArray.push(callback => eachFunction(element, callback) );
      });

      if (tempArray.length) {
        finalArray.push(tempArray);
      }

      return finalArray;
    };

    let helper = (tasks, index, callback) => {
      if (index === tasks.length) {
        callback();
      } else {
        async.parallel(tasks[index], err => {
          if (err) {
            callback(err);
          } else {
            helper(tasks, index + 1, callback);
          }
        });
      }
    };

    let executeInSeries = (tasks, callback) => {
      helper(tasks, 0, callback);
    };

    let array = [...iterable];

    if (array.length === 0) {
      cb();
    } else {
      let tasks = breakArray(array);
      executeInSeries(tasks, cb);
    }
  }
};

module.exports = async;
