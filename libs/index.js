const promisify = require('yeps-promisify');
const Koa = require("koa");
const statuses = require('statuses');
const isJSON = require('koa-is-json');

const App = require('yeps');
const http = require('http');





module.exports =
    class extends App{

        constructor(){
            super();
            this.koa = new Koa();
            this.toJSON = () => this.koa.toJSON.apply(this);
            this.inspect = () => this.koa.inspect.apply(this);
        }

        listen() {
            console.log('listen');
            const server = http.createServer(this.resolve());
            return server.listen.apply(server, arguments);
        }

        route(router){
            this.then(router.resolve());
            return this;
        }

        resolve() {
            // console.log('Server started');
            return async (req, res) => {
                let ctx = this.createContext(req,res);
                // console.log(ctx);
                try {
                    await promisify(ctx, this.promises);
                    // console.log("End promisify");
                } catch (error) {
                    if(!error)
                        this.respond(ctx);
                    else {
                        console.log.error();
                        console.log.error(error);
                        console.log.error();
                        await Promise.all(this.error.map(fn => fn(error, ctx)));
                    }
                }
            };
        }

        createContext(req,res){
            res.statusCode = 404;
            const ctx = this.koa.createContext(req,res);
            ctx.app = ctx.request.app = ctx.response.app = this;
            this.then(async ctx =>
                this.respond(ctx)
            );
            return ctx;
        }

        respond(ctx) {
        // allow bypassing koa
        if (false === ctx.respond) return;

        const res = ctx.res;
        if (!ctx.writable) return;

        let body = ctx.body;
        const code = ctx.status;

        // ignore body
        if (statuses.empty[code]) {
            // strip headers
            ctx.body = null;
            return res.end();
        }

        if ('HEAD' == ctx.method) {
            if (!res.headersSent && isJSON(body)) {
                ctx.length = Buffer.byteLength(JSON.stringify(body));
            }
            return res.end();
        }

        // status body
        if (null == body) {
            body = ctx.message || String(code);
            if (!res.headersSent) {
                ctx.type = 'text';
                ctx.length = Buffer.byteLength(body);
            }
            return res.end(body);
        }

        // responses
        if (Buffer.isBuffer(body)) return res.end(body);
        if ('string' == typeof body) return res.end(body);
        if (body instanceof Stream) return body.pipe(res);

        // body: json
        body = JSON.stringify(body);
        if (!res.headersSent) {
            ctx.length = Buffer.byteLength(body);
        }
        res.end(body);
    }
    };