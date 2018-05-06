
require('dotenv').config();

const DynamodbStore =  require('../stores/dynamodbStore');
const chai = require('chai');
const should = chai.should();

describe('dynamodbStore basic', function(){
    let conf={
        region: "us-east-1",
        endpoint: "https://dynamodb.us-east-1.amazonaws.com",
        httpOptions: {
            timeout:3000
        },
        tableName:  'dev.calculator'
    };

    let dynamodb = new DynamodbStore(conf);
    let key = 'testKey';
    let keyNotExist = 'keyDoNotExist';

    before((done)=>{
        dynamodb.ready()
            .then(()=>dynamodb.delete(key))
            .then(()=>dynamodb.delete(keyNotExist))
            .then(()=>done())
            .catch(err=>console.log(err));
    });

    after((done)=>{
        dynamodb.delete(key)
            .then(()=>dynamodb.delete(keyNotExist))
            .then(()=>done())
            .catch(err=>console.log(err));
    });

    it('get/set/has', function(done){
        dynamodb.has(key)
            .then((val)=>{
                val=!!val;
                val.should.equal(false);
                return dynamodb.set(key, '123');
            })
            .then(()=>dynamodb.has(key))
            .then((val)=>{
                val=!!val;
                val.should.equal(true);
            })
            .then(()=>dynamodb.get(key))
            .then(val=>{
                val.should.equal('123');
                return dynamodb.delete(key);
            })
            .then(()=>dynamodb.get(keyNotExist))
            .then(val=>{
                should.equal(val, null)
            })
            .then(()=>{
                done();
            })
            .catch(err=>console.log(err))
        ;

    });
});
