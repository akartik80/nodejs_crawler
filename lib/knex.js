// lib file for knex

"use strict";

const knex = require("knex");
const config = require("../config");

const client = knex(config.knex);

module.exports = client;
