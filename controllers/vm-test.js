'use strict';
const fs = require('mz/fs');

module.exports = {
    'GET /vm-test': async (ctx, next) => {
        ctx.render('vm-test.html');
    },

    'GET /todolist': async (ctx, next) => {
        var user = ctx.state.user;
        ctx.render('toDoList.html');

        /*ctx.response.type = 'text/html';
        ctx.response.body = await fs.readFile('./views/check.html');*/
    },

    'GET /excel': async (ctx, next) => {
        ctx.render('excel.html');
    }
};