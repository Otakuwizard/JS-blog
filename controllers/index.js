'use strict';

module.exports = {
    'GET /': async (ctx, next) => {
        let user = ctx.state.user;
        if(user){
            ctx.render('room.html', {
                user: user
            })
        }else{
            ctx.response.redirect('/signin');
        }
    },

    'GET /register': async(ctx, next) => {
        ctx.render('register.html', {
            title: 'Register'
        })
    }
};