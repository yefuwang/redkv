"use strict";

const optionalDependency = require('../optionalDependency');

var sqlite = null;

class SQLiteStore {
    constructor(options){
        if (!sqlite) {
            sqlite = optionalDependency.require('better-sqlite3');
        }

        if(options) {
            options = JSON.parse(JSON.stringify(options));
        }
        else {
            throw new Error(
                'Parameters are required to create SQLite store');
        }

        if(!options.path) {
            throw new Error('path must be set in options');
        }
        
        this.tableName = options.tableName || 'redkv';
        this.keyColumn = options.keyColumn || 'redk';
        this.valueColumn = options.valueColumn || 'redv';
        this._db = new sqlite(options.path);

        this._createTable(this.tableName);
    }

    _createTable(tableName){
        let sql = ' CREATE TABLE IF NOT EXISTS ' + tableName +
                  ' (' + this.keyColumn   + ' TEXT PRIMARY KEY ,' +
                  ' '  + this.valueColumn +')';

        this._db.prepare(sql).run();
    }

    ready() {
        return Promise.resolve(true);
    }

    set(key, value) {
        let sql = 'REPLACE INTO ' + this.tableName+
            ' ('+this.keyColumn +', ' + this.valueColumn +')'+
            ' VALUES (@k, @v)'; 

        return Promise.resolve(
            this._db.prepare(sql).run({k:key, v:value}));
    }

    get(key) {
        let sql = 'SELECT '+ (this.valueColumn) +
            '  FROM ' +  (this.tableName) + 
            ' where '+ (this.keyColumn) +' = @k';
        // Wrape with an IIFE so that exceptions can be reported
        let that = this;
        return Promise.resolve(function(){
            let val = that._db.prepare(sql).get({k : key});
            return val === undefined ? null:val[that.valueColumn];
        }());
    }

    delete(key) {
        let sql = 'DELETE FROM ' + this.tableName  + 
            ' where '+ this.keyColumn  +
            ' = @k';
        return this._db.prepare(sql).run({k:key});
    }

    has(key){
        return this.get(key)
            .then(obj=>{
                return obj!==null;
            });
    }
};

module.exports = SQLiteStore;
