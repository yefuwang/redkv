"use strict";

const tryRequire = require('try-require');
const mysql = require('mysql');
var {promisify} = require('util');

class MySQLStore {
    constructor(options){
        options = JSON.parse(JSON.stringify(options));

        if((!promisify) ||
            (options &&
                (options.useBluebird || options.useBlueBird ))) {
            const BlueBird = require('bluebird');
            promisify = BlueBird.promisify;
            delete options.useBlueBird;
            delete options.useBluebird;
        }

        if(!options) {
            throw new Error('Parameters are required to create MysqlStore' +
           '. See the parameters passeed to mysql.createPool in mysql document');
        }

        if(!options.tableName) {
            throw new Error('tableName must be set in options');
        }

        if(!options.keyColumn) {
            throw new Error('keyColumn) must be set in options')
        }

        if(!options.valueColumn) {
            throw new Error('valueColumn) must be set in options')
        }
        
        this.tableName = options.tableName;
        delete options.tableName;
        this.keyColumn = options.keyColumn;
        delete options.keyColumn;
        this.valueColumn = options.valueColumn;
        delete options.valueColumn;
        this._pool = mysql.createPool(options);
        this._query = promisify(this._pool.query).bind(this._pool);
    }

    ready() {
        return Promise.resolve(true);
    }
    static available(){ return true;}

    set(key, value) {
        let sql = 'INSERT INTO '+ this._pool.escapeId(this.tableName) +
            ' (' +  this._pool.escapeId(this.keyColumn) + 
            ', '+ this._pool.escapeId(this.valueColumn) + ')' +
            ' VALUES (' + this._pool.escape(key) +', ' +
            this._pool.escape(value) +') ' + 
            'ON DUPLICATE KEY UPDATE ' + this._pool.escapeId(this.valueColumn) +
            ' = ' + this._pool.escape(value);
        return this._query(sql);
    }

    get(key) {
        let sql = 'SELECT '+ this._pool.escapeId(this.valueColumn) +
            '  FROM ' +  this._pool.escapeId(this.tableName) + 
            ' where '+ this._pool.escapeId(this.keyColumn) +
            ' = ' +this._pool.escape(key)
        return this._query(sql)
            .then(val=>{
                if (val.length===0) {
                    return null;
                }
                else {
                    return val[0][this.valueColumn];
                }
            });
    }

    delete(key) {
        let sql = 'DELETE FROM ' +  this._pool.escapeId(this.tableName) + 
            ' where '+ this._pool.escapeId(this.keyColumn) +
            ' = ' +this._pool.escape(key);
        return this._query (sql);
    }

    has(key){
        return this.get(key)
            .then(obj=>{
                return obj!==null;
            });
    }

};

module.exports = MySQLStore;
