'use strict'

const model = require('./model');
var User = model.users;

(async () => {
    var user1 = await User.create({
        name: 'admin',
        email: 'admin',
        password: '125315',
        gender: true
    });
    console.log('Created user: ' + user1.name);
})();