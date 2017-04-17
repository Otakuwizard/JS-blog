'use strict';

const fs = require('fs');

function add_mappings(router, mapping){
    for(let key in mapping){
        if(key.startsWith('GET')){
            console.log(`found ${key}`);
            router.get(key.substring(4), mapping[key]);
        }else if(key.startsWith('POST')){
            console.log(`found ${key}`);
            router.post(key.substring(5), mapping[key]);
        }else if(key.startsWith('PUT')){
            console.log(`found ${key}`);
            router.put(key.substring(4), mapping[key]);
        }else if(key.startsWith('DELETE')){
            console.log(`found ${key}`);
            router.del(key.substring(7), mapping[key]);
        }else{
            console.log(`invalid URL ${key}`);
        }
    }
}

function add_controller(router, dir){
    var fp = __dirname + '/' + dir;
    var files = fs.readdirSync(fp);
    var js_files = files.filter((f) => {
        return f.endsWith('.js');
    });

    for(let f of js_files){
        console.log(`process controller ${f}`);
        add_mappings(router, require(fp + '/' + f));
    }
}

module.exports = (dir) => {
    var dir_path = dir || 'controllers';
    const router = require('koa-router')();
    add_controller(router, dir_path);
    return router.routes();
};

