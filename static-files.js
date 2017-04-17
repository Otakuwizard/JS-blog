'use strict';

const fs = require('mz/fs');
const mime = require('mime');
const path = require('path');

//url: for example '/static/'
// dir for example __dirname
function add_files(url, dir){
    return async (ctx, next) => {
        var url_path = ctx.request.path;
        if(url_path.startsWith(url)){
            var fp = path.join(dir, url_path);
            if(await fs.exists(fp)){
                ctx.response.type = mime.lookup(url_path);
                ctx.response.body = await fs.readFile(fp);
            }else{
                ctx.response.status = 404;
            }
        }
        await next();
    };
}

module.exports = add_files;