const App = require('../libs');
const error = require("yeps-error");
const logger = require('yeps-logger');
const router = require('./controllers');


module.exports = new App()
    .all([
        logger(),
        error(),
    ])
    .route(router)
;

// app.catch(async (err, ctx) => {
//     ctx.res.writeHead(500);
//     ctx.res.end(err.message);
// });


