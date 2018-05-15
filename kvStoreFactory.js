'use strict';

const RedisStore = require('./stores/redisStore');
const DynamodbStore = require('./stores/dynamodbStore');
const MongoDBStore =  require('./stores/mongodbStore');
const MySQLStore = require('./stores/mySQLStore');

module.exports = function (storeName, options) {
    let store = null;
    switch(storeName.toUpperCase()){
        case 'REDIS':
            if(RedisStore.available()) {
                store = new RedisStore(options); 
            }
            break;
        case 'DYNAMODB':
            if (DynamodbStore.available()) {
                store= new DynamodbStore(options);
            }
            break;
        case 'MONGODB': 
            if (MongoDBStore.available()) {
                store= new MongoDBStore(options);
            }
            break;
        case 'MYSQL':
            if(MySQLStore.available()) {
                store = new MySQLStore(options);
            }
            break;
        default:
            break;
    }
    if(!store) {
        throw new Error('Store '+storeName + ' is not available');
    }
    return store;
};

