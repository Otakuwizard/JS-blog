'use strict';

const db = require('../db');

module.exports = db.defineModel('excel', {
    row: db.INTEGER,
    col: db.INTEGER,
    content: db.STRING(50),
    align: db.STRING(50),
    user_id: db.STRING(50),
    contentEditable: db.BOOLEAN
    //sheet_id: db.STRING(50)
});