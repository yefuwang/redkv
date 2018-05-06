const tryRequire = require('try-require');
const redis = require('redis');
const {promisify} = require('util');

class RedisStore {
    constructor(options){
        this.client = redis.createClient(options);
        this.get = promisify(this.client.get).bind(this.client);
        this.set = promisify(this.client.set).bind(this.client);
        this.has = promisify(this.client.exists).bind(this.client);
        this.delete = promisify(this.client.del).bind(this.client);
    }

    static available() {
        return !!redis;
    }

    ready () {
        return Promise.resolve();
    }
};

module.exports = RedisStore;

