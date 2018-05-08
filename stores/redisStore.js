'use strict';

const tryRequire = require('try-require');
const redis = require('redis');
const {promisify} = require('util');

class RedisStore {
    constructor(options){
        if(promisify) {
            this.client = redis.createClient(options);
            this.get = promisify(this.client.get).bind(this.client);
            this.set = promisify(this.client.set).bind(this.client);
            this.has = promisify(this.client.exists).bind(this.client);
            this.delete = promisify(this.client.del).bind(this.client);
        }
        else {
            const bluebird = require('bluebird');
            bluebird.promisifyAll(redis.RedisClient.prototype);
            bluebird.promisifyAll(redis.Multi.prototype);
            this.client = redis.createClient(options);
            this.get = this.client.getAsync.bind(this.client);
            this.set = this.client.setAsync.bind(this.client);
            this.has = this.client.existsAsync.bind(this.client);
            this.delete = this.client.delAsync.bind(this.client);
        }
    }

    static available() {
        return !!redis;
    }

    ready () {
        return Promise.resolve();
    }
};

module.exports = RedisStore;

