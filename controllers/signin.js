'use strict';


module.exports = {
    'GET /signin': async (ctx, next) => {
        ctx.render('signin.html')
    },
    
    /*'POST /signin': async (ctx, next) => {
        index++;
        let name = ctx.request.body.name || 'GastA';
        let user = {
            id: index,
            name: name,
            image: index % 10
        };
        let value = Buffer.from(JSON.stringify(user)).toString('base64');
        console.log(`Set cookie value: ${value}`);
        ctx.cookies.set('name', value);
        ctx.response.redirect('/');
    },*/

    'GET /signout': async (ctx, next) => {
        ctx.cookies.set('Zyklop', '');
        ctx.response.redirect('/signin');
    }
};