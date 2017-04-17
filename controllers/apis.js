'use strict';

const model = require('../model');
const User = model.users;
const TDL = model.todolists;
const crypto = require('crypto');
const CookieKey = 'Zyklop';
const APIError = require('../rest').APIError;
const Excel = model.excel;
const MaxRow = 100;
const MaxCol = 12;

//var hash_SHA1 = crypto.createHash('sha1'); Wrong!
function user2cookie(user){
    console.log('user2cookie');
    var value = [user.id, user.password, user.email, CookieKey];
    console.log(JSON.stringify(value));
    var hash_cookie = (crypto.createHash('sha1')).update(value.join('-')).digest('hex');
    console.log(hash_cookie);
    var l = [user.id, hash_cookie];
    console.log('return cookie');
    return l.join('-');
} 

function merge(oldObj, newObj){
    newObj = newObj || {};
    if(typeof(oldObj) !== 'object'){
        return oldObj;
    }
    for(let i in oldObj){
        if(typeof oldObj[i] === 'object'){
            newObj[i] = merge(oldObj[i]);
        }else{
            newObj[i] = oldObj[i];
        }
    }
    return newObj;
}

async function findAllCell(user_id){
    var rows = [];
    var row = [];
    for(let i=0; i<MaxRow; i++){
        row = [];
        for(let j=0; j<MaxCol; j++){
            var cell = await Excel.find({
                where:{
                    user_id: user_id,
                    row: i,
                    col: j
                }
            });
            row.push(cell);
        }
        rows.push(row);
    }
    return rows;
}

module.exports = {
    'POST /api/register': async (ctx, next) => {
            console.log(JSON.stringify(ctx.request.body));
            var users = await User.findAll({
                where: {
                    email: ctx.request.body.email
                }
            });
            if(users.length > 0){
                console.log('Error'+ JSON.stringify(users));
                throw new APIError('email:in_used', 'email already in used');
            }else{
                console.log('no error');
                var new_user = await User.create({
                    name: ctx.request.body.name,
                    password: ctx.request.body.password,
                    email: ctx.request.body.email,
                    gender: ctx.request.body.gender
                });
                console.log('Created');
                new_user.password = ((crypto.createHash('sha1')).update(new_user.id + ':' + new_user.password)).digest('hex');
                new_user.save();
                var user_cookie = user2cookie(new_user);
                ctx.cookies.set(CookieKey, user_cookie);
                var data = {
                    name: new_user.name,
                    email: new_user.email,
                    id: new_user.id,
                    gender: new_user.gender,
                    image: new_user.image,
                    password: '******'
                };
                //new_user.password = '******';
                ctx.rest(data);
                //ctx.response.redirect('/');
            }

    },

    'POST /api/authenticate': async (ctx, next) => {
        console.log('[API] recevied post request');
        console.log(ctx.request.body.password);
        var user = await User.find({
            where: {
                email: ctx.request.body.email
            }
        });
        console.log(JSON.stringify(user));
        if(!user){
            console.log('Error');
            throw new APIError('email:not_found', 'email not yet registerd');
        }else{
            var password = ctx.request.body.password;
            var hash_password = ((crypto.createHash('sha1')).update(user.id + ':' + password)).digest('hex');
            console.log(hash_password === user.password);
            if(hash_password !== user.password){
                console.log('bad paaaword');
                throw new APIError('user:autentication_failed', 'invalid email or password');
            }else{
                console.log('create cookie');
                var user_cookie = user2cookie(user);
                console.log(user_cookie);
                ctx.cookies.set(CookieKey, user_cookie);
                var data = {
                    name: user.name,
                    email: user.email,
                    id: user.id,
                    gender: user.gender,
                    image: user.image,
                    password: '******'
                };
                ctx.rest(data);
            }
        }
    },

    CookieKey: CookieKey,

    user2cookie: user2cookie,

    merge: merge,

    'GET /api/todolist': async (ctx, next) => {
        var user_id = ctx.state.user.id;
        var todos = await TDL.findAll({
            where:{
                user_id: user_id
            }
        });
        ctx.rest({
            todos: todos,
            user_id: user_id
        });
    },

    'POST /api/todolist': async (ctx, next) => {
        var new_tdl = await TDL.create({
            title: ctx.request.body.title,
            content: ctx.request.body.content,
            user_id: ctx.state.user.id
        });
        console.log(ctx.request.body.title + ': ' + ctx.request.body.content);
        ctx.rest(new_tdl);
    },

    'PUT /api/todolist': async (ctx, next) => {
        var tdl = await TDL.find({
            where: {
                id: ctx.request.body.id
            }
        });
        console.log('[id]: ' + ctx.request.body.id);
        if(tdl){
            console.log('[td]: ' + ctx.request.body.title + ' ' + ctx.request.body.content);
            tdl.title = ctx.request.body.title.trim();
            tdl.content = ctx.request.body.content.trim();
            tdl.save();
            ctx.rest(tdl);
        }else{
            console.log('[UPDATE]: update todolist failed');
            throw new APIError('TODOLIST:update_failed', 'update failed');
        }
    },

    'DELETE /api/todolist/:id': async (ctx, next) => {
        console.log('[DELETE]: ' + ctx.params.id);
        var tdl = await TDL.find({
            where: {
                id: ctx.params.id
            }
        });
        if(tdl){
            tdl.destroy();
            ctx.rest(tdl);
        }else{
            console.log('todlist not found delete failed');
        }
    },

    'GET /api/excel': async (ctx, next) => {
        var user_id = ctx.state.user.id;
        var tables = await findAllCell(user_id);
        ctx.rest({
            tables: tables
        });
    },

    /*'PUT /api/excel/:id': async(ctx, next) => {
        var cell = await Excel.find({
            where: {
                id: ctx.params.id,
                user_id: ctx.state.user.id
            }
        });

        cell.content = ctx.request.body.content;
        cell.save();
        ctx.rest(cell);
    },*/

    /*'DELETE /api/excel/:id': async (ctx, next) => {
        var cell = await Excel.find({
            where: {
                id: ctx.params.id,
                user_id: ctx.state.user.id
            }
        });
        cell.destroy();
        var tables = await findAllCell(ctx.state.user.id);
        ctx.rest({
            tables: tables
        });
    },*/

    'POST /api/excel': async (ctx, next) => {
        var user_id = ctx.state.user.id;
        for(let i=0; i<MaxRow; i++){
            for(let j=0; j<MaxCol; j++){
                let new_cell = ctx.request.body.tables[i][j];
                let old_cell = await Excel.find({
                    where: {
                        row: new_cell.row,
                        col: new_cell.col,
                        user_id: user_id
                    }
                })
                if(old_cell){
                    old_cell.content = new_cell.content;
                    old_cell.save();
                }else{
                    new_cell.user_id = user_id;
                    await Excel.create(new_cell);
                }
            }
        }

        var tables = await findAllCell(user_id);
        ctx.rest({
            tables: tables
        });
    }
    
};