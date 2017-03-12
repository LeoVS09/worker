const Router = require('yeps-router');

const router = new Router();

router
    .get('/').then(async ctx =>
        ctx.body = "lol"
    )
    .get('/trol').then(async ctx =>
        ctx.body = "ahahahahahahhaha"
    )
;

module.exports = router;