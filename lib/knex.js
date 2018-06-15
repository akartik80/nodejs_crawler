// lib file for knex

"use strict";

const knex = require("knex");

const client = Knex(config.knex);

module.exports = client;
