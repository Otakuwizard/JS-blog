'use strict';

const fs = require('fs');
const path = require('path');

var config = {};
var fp = path.join(__dirname, 'config-override');

if(process.env.NODE_ENV !== 'production'){
    config = Object.assign({}, require('./config-default'), require('./config-test'));
}else{
    if(fs.existsSync(fp)){
        config = Object.assign({}, require('./config-default'), require('./config-override'));
    }else{
        config = require('./config-default');
    }
}

module.exports = config;