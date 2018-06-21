// lib file for async

"use strict";

const logger = require("./logger");

const async = {
  parallel: (tasks, cb) => {
    let noOfCallbacks = 0;
    let error = false;

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
  },

  forEachLimit: (iterable, limit, eachFunction, cb) => {
    let array = [...iterable];
    let callbackCalled = false;
    let index = 0;
    let curPoolSize = 0;
    let error = false;

    if (array.length < limit) {
      let tasks = [];

      array.forEach((element) => {
        tasks.push(callback => eachFunction(element, callback));
      });

      async.parallel(tasks, cb);
    } else {
      setImmediate(() => { // delegate to task queue
        helper(array);
      });
    }

    let helper = (array) => {
      if (index >= array.length) {
        if (!callbackCalled) {
          cb();
          callbackCalled = true;
        }

        return;
      }

      while (curPoolSize >= 0 && curPoolSize < limit && !error && index < array.length) {
        eachFunction(array[index], err => {
          if (err) {
            error = true;
            cb(err);
          }

          if (!error) {
            curPoolSize--;
            helper(array);
          }
        });

        curPoolSize++;
        index++;
      }

      if (index >= array.length && !callbackCalled) {
        callbackCalled = true;
        cb();
      }
    };
  }
};


module.exports = async;
