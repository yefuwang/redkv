const tryRequire = require('try-require');
const DynamoDB = tryRequire("aws-sdk/clients/dynamodb");

class DynamoDBStore {
    constructor(options){
        if(!options) {
            throw new Error('Options required when constructing DynamoDBStore');
        }
        if (!options.tableName){
            throw new Error('Options required: tableName');
        }

        let dynamodb = new DynamoDB(options);

        let params = {
              TableName: options.tableName
             };
        this.tableName = options.tableName;
        this.attributeName = options.attributeName || 'v';
        let that = this;

        this._readyHandle =  dynamodb.describeTable(params).promise()
            .then(data=>{
                let keySchema = ((data||{}).Table||{}).KeySchema;
                for (let item of keySchema){
                    if (item.KeyType=="HASH"){
                        that.hashKey = item.AttributeName;
                    }
                }

                if(!that.hashKey){
                    return Promise.reject('Failed finding hash key in table' +
                        options.tableName);
                }

                that.docClient = new DynamoDB.DocumentClient(options); 
            });
    }

    ready(){
        return this._readyHandle; 
    }

    static available() {
        return !!DynamoDB;
    }

    delete(key){
        let params = {TableName: this.tableName, Key:{}};
        params.Key[this.hashKey] = key;
        return this.docClient.delete(params).promise();
    }

    get(key){
        let params = {TableName: this.tableName, Key:{}};
        params.Key[this.hashKey] = key;
        let that = this;
        return this.docClient.get(params)
            .promise()
            .then(val=>((val||{}).Item||{})[that.attributeName]);
    }

    set(key, value){
        let params = {TableName: this.tableName,
            Item:{
                [this.attributeName]: value
            }
        };
        params.Item[this.hashKey] = key;
        return this.docClient.put(params).promise();
    }

    has(key){
        console.log('ddb.has'+key);
        return this.get(key)
            .then(obj=>obj!==undefined);
    }
};

module.exports = DynamoDBStore;
