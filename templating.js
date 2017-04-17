'use strict';

const nunjucks = require('nunjucks');

function createEnv(path, opts){
    var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path || 'views', {
        noCache: opts.noCache || false,
        watch: opts.watch || false
    }),{
        autoescape: opts.autoescape && true,
        throwOnUndefine: opts.throwOnUndefine || false
    });

    if(opts.filters){
        for(let fn in opts.filters){
            env.addFilter(fn, opts.filters[fn]);
        }
    }

    return env;
}

module.exports = (path, opts) => {
    var env = createEnv(path, opts);
    return async (ctx, next) => {
        ctx.render = function(view, mode){
            ctx.response.type = 'text/html';
            ctx.response.body = env.render(view, Object.assign({}, ctx.state || {}, mode || {}));
        };
        await next();
    };
};