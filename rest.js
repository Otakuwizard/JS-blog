'use strict';

module.exports = {
    APIError: function(code, message){
        this.code = code || 'internal:unknown_error';
        this.message= message || '';
    },

    restify: (pathPrefix) => {
        pathPrefix = pathPrefix || '/api/';
        return async (ctx, next) => {
            if(ctx.request.path.startsWith(pathPrefix)){
                ctx.rest = function(obj){
                    ctx.response.type = 'application/json';
                    ctx.response.body = obj;
                };
                try {
                    await next();
                } catch (error) {
                    ctx.response.status = 400;
                    ctx.response.type = 'application/json';
                    ctx.response.body = {
                        code: error.code || 'internal:unknown_error',
                        message: error.message || ''
                    };
                }
            }else{
                await next();
            }
        };
    }
}