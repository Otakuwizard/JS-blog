'use strict';

const Sequelize = require('sequelize');
const uuid = require('node-uuid');
const config = require('./config');
const sequelize = new Sequelize(config.database, config.username, config.password,{
    host: config.host,
    dialect: config.dialect,
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});
var index = 0;

function generateId(){
    return uuid.v4();
}

function generateImg(){
    index = index === 10 ? 0 : (index+1);
    return index;
}
const ID_TYPE = Sequelize.STRING(50);

function defineModel(name, attributes){
    var attrs = {};
    for(let key in attributes){
        if(typeof(attributes[key]) === 'object' && (attributes[key])['type']){
            //使用(attributes[key])['type']可以避免因为STRING等typeof结果同样是object的数据类型而产生的误判。
            attributes[key].allowNull = attributes[key].allowNull || false;
            attrs[key] = attributes[key];
        }else{
            attrs[key] = {
                type: attributes[key],
                allowNull: false,
            };
        }
    }

    attrs.id = {
        type: ID_TYPE,
        primaryKey: true
    }

    attrs.image = {
        type: Sequelize.INTEGER,
        allowNull: false
    }

    attrs.createdAt = {
        type: Sequelize.BIGINT,
        allowNull: false
    }

    attrs.updatedAt = {
        type: Sequelize.BIGINT,
        allowNull: false
    }

    attrs.version = {
        type: Sequelize.BIGINT,
        allowNull: false
    }

    return sequelize.define(name, attrs, {
        tablename: name,
        timestamps: false,
        hooks: {
            beforeValidate: (obj) => {
                var now = Date.now();
                if(obj.isNewRecord){
                    if(!obj.id ){
                        obj.id = generateId();
                    }
                    obj.image = generateImg();
                    obj.createdAt = now;
                    obj.updatedAt = now;
                    obj.version = 0;
                }else{
                    obj.updatedAt = now;
                    obj.version++;
                }
            }
        }
    });
}

var exp = {};
const TYPE = ['STRING', 'BIGINT', 'BOOLEAN', 'TEXT', 'INTEGER', 'DATEONLY', 'DOUBLE'];
for(let tp of TYPE){
    exp[tp] = Sequelize[tp];
}
exp.id = ID_TYPE;
exp.generateId = generateId;
exp.generateImg = generateImg;
exp.defineModel = defineModel;
exp.sync = () => {
    if(process.env.NODE_ENV !== 'production'){
        return sequelize.sync({force: true});
    }else{
        throw new Error('Cannot sync() in production environment');
    }
}

module.exports = exp;