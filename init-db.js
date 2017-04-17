'use strict';

const register = require('babel-core/register');

register({
    presets: ['stage-3']
});

const model = require('./model.js');

model.sync().then(() => {
    console.log('init db OK...');
    process.exit(0);
}).catch((err) => {
    console.log(err);
})