'use strict';

const fs = require('fs');
const db = require('./db');
const path = require('path');

var fp = path.join(__dirname, 'models');
var files = fs.readdirSync(fp);
var models = files.filter((f) => {
    return f.endsWith('.js');
});

for(let f of models){
    let model_name = f.substring(0, f.length-3);
    console.log(`found model: ${model_name}`);
    module.exports[model_name] = require(fp+`/${f}`);
}

module.exports.sync = () => {
    return db.sync();
}