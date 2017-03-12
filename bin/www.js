#!/usr/bin/env node

const config = require('../config/default.json');
const app = require('../app');


app.listen(config.port);

console.log("Server start at the port: " + config.port);