'use strict';

const optionalDependency = require('../optionalDependency');
var redis = null;
const {promisify} = require('util');


class RedisStore {
	constructor(options){
		if (!redis) {
			redis=optionalDependency.require('redis');
		}
		if((!promisify) ||
			(options &&
				(options.useBluebird || options.useBlueBird ))) {
			const bluebird = require('bluebird');
			bluebird.promisifyAll(redis.RedisClient.prototype);
			bluebird.promisifyAll(redis.Multi.prototype);
			this.client = redis.createClient(options);
			this.get = this.client.getAsync.bind(this.client);
			this.set = this.client.setAsync.bind(this.client);
			this._redisHas = this.client.existsAsync.bind(this.client);
			this.delete = this.client.delAsync.bind(this.client);
		}
		else {
			this.client = redis.createClient(options);
			this.get = promisify(this.client.get).bind(this.client);
			this.set = promisify(this.client.set).bind(this.client);
			this._redisHas = promisify(this.client.exists).bind(this.client);
			this.delete = promisify(this.client.del).bind(this.client);
		}
	}

	ready () {
		return Promise.resolve();
	}

	has (key) {
		// convert to boolean
		return this._redisHas(key).then(x=>{
			return !!x;
		});
	}
};

module.exports = RedisStore;

