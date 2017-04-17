'use strict';

const db = require('../db');

module.exports = db.defineModel('todolists', {
    title: db.STRING(100),
    content: db.STRING(200),
    user_id: db.STRING(50)
});