"use strict";

const tryRequire = require('try-require');
const MongoClient = require('mongodb').MongoClient;
const {promisify} = require('util');


class MongoDBStore {
    constructor(options){
        const url = (options ||{}).url || 'mongodb://localhost:27017/redKV';
        const collectionName= (options||{}).collection || 'redKV';
        this.keyField = (options ||{}).keyField || 'redK';
        this.valueField = (options ||{}).valueField || 'redV';
        this._readyPromise = MongoClient.connect(url)
            .then((client)=>{
                this._db = client.db();
                this._collection = this._db.collection(collectionName);
                return this._collection.createIndex({[this.keyField]:1}, {unique:true});
            });
    }

    ready() {
        return this._readyPromise; 
    }

    set(key, value) {
        return this._collection.updateOne(
            {[this.keyField] : key},
            {$set: {[this.keyField] : key, [this.valueField] : value}},
            { upsert: true}
        );
    }

    get(key) {
        return this._collection.findOne({[this.keyField] : key})
            .then(obj=>{
                if(obj===null) {
                    return null;
                }
                else {
                    return obj[this.valueField];
                }
            });
    }

    delete(key) {
        return this._collection.deleteOne({[this.keyField] : key});
    }

    has(key){
        return this.get(key)
            .then(obj=>{
                return obj!==null;
            });
    }

};

module.exports = MongoDBStore;
