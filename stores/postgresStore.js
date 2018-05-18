"use strict";

const tryRequire = require('try-require');
const {Pool, Client} = require('pg');

class PostgresStore {
    constructor(options){
        if(options) {
            options = JSON.parse(JSON.stringify(options));
        }
        else {
            throw new Error('Parameters are required to create Postgre Store' +
           '. See the parameters passeed to mysql.createPool in postgre document');
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
        this._pool = new Pool(options);

        // Prebuild all the SQLs, saving a little bit of CPU later. 
        this._deleteSQL = 'DELETE FROM ' + this.tableName +
            ' WHERE '+this.keyColumn+' = $1';

        this._getSQL = 'SELECT ' + this.valueColumn +
                      ' FROM ' + this.tableName +
                      ' WHERE ' + this.keyColumn + ' = $1';

        this._setSQL = 'INSERT INTO '+this.tableName+
            ' (' + this.keyColumn + ',' +this.valueColumn + ') ' +
            ' VALUES  ($1, $2)' +
            ' ON CONFLICT ('+this.keyColumn+') DO UPDATE ' +
            ' SET '+this.keyColumn+' = $1, ' +
            '     '+this.valueColumn+' = $2;';
    }

    ready() {
        return Promise.resolve(true);
    }

    set(key, value) {
        return this._pool.query(this._setSQL, [key,value]);
    }

    get(key) {
        return this._pool.query(this._getSQL, [key])
            .then(val=>val.rows)
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
        return this._pool.query(this._deleteSQL, [key]);
    }

    has(key){
        return this.get(key)
            .then(obj=>{
                return obj!==null;
            });
    }

};

module.exports = PostgresStore;

