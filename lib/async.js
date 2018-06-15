// lib file for async

"use strict";

const async = require("async");
const Promise = require("bluebird");

Promise.promisifyAll(async);

module.exports = async;
