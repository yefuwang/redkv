const RedisStore = require('./stores/redisStore');
const DynamodbStore = require('./stores/dynamodbStore');

module.exports = function (storeName, options) {
    switch(storeName.toUpperCase()){
        case 'REDIS':
            if(RedisStore.available()) {
                console.log('Constructed redis');
                return new RedisStore(options); 
            }
            else {
                return null;
            }
            break;
        case 'DYNAMODB':
            if (DynamodbStore.available()) {
                console.log('Constructed ddb');
                return new DynamodbStore(options);
            }
            else {
                return null;
            }
            break;
        default:
            return null;
    }
};

