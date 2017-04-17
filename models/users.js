'use strict';

const db = require('../db');

module.exports = db.defineModel('users', {
    name: db.STRING(100),
    password: db.STRING(100),
    gender: db.BOOLEAN,
    email: {
        type: db.STRING(100),
        unique: true
    }
})