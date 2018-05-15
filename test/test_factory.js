'use strict';

require('dotenv').config();
const RedKV = require('../index.js');
const chai = require('chai');
const should = chai.should();
const testStore = require('./test_store');

const singleStoreTests = [
    {storeName: 'mongodb'}, 
    {storeName: 'redis'}, 
    {storeName: 'dynamodb', options:{
        region: "us-east-1",
        endpoint: process.env.DDB_ENDPOINT || "https://dynamodb.us-east-1.amazonaws.com",
        httpOptions: {
            timeout:3000
        },
        tableName:  'dev.calculator',
        attributeName: Math.random().toString(36)
    }},
    {storeName: 'mongodb', options:{collection:'StrangeCollection3'}},
    {storeName: 'mysql', options:{
        // CREATE TABLE redkv (redk VARCHAR(256), redv TEXT, UNIQUE(redk));
        connectionLimit : 10,
        host : '127.0.0.1',
        user : 'redtester',
        password: 'redtesterpwd',
        database: 'redkv_test', 
        tableName: 'redkv',
        keyColumn: 'redk',
        valueColumn: 'redv'
    }}
];

const singleTestBuilder = function(conf){
    console.log('>>>>Testing ' + conf.storeName );
    let kvStore = new RedKV();
    let backEnd = kvStore.addStore(conf.storeName, conf.options);
    return kvStore.ready()
        .then(()=>testStore.testOneStore(kvStore))
        .then(()=>testStore.testOneStore(backEnd))
        .then(()=>console.log('<<<<Done testing ' + conf.storeName));
};

const doubleTestBuilder = function(conf1, conf2){
    let testName =  conf1.storeName + ' '+conf2.storeName
    console.log('>>>>DoubleTesting ' + testName);
    let kvStore = new RedKV();
    let store1 = kvStore.addStore(conf1.storeName, conf1.options);
    let store2 = kvStore.addStore(conf2.storeName, conf2.options);
    return testStore.testTwoStores(kvStore, store1, store2)
        .then(()=>console.log('<<<<DoubleTesting ' +  testName));
};

describe('kvstore tests', function(){
    this.timeout(5000000);

    it('run all single tests', function(){
        return  singleStoreTests.reduce(
            (current, conf)=>{
                return current.then(()=>singleTestBuilder(conf))
            },
            Promise.resolve());
    });

    it('double tests', function(){
        // we will reuse the test definitions for single tests 
        // Pairs of indexes in array singleStoreTests
        let testPairs = [[1,0],[1,2],[0,2],[1,3],[2,3],[0,4],[1,4]];
        return testPairs.reduce(
            (accu, curr)=>accu.then(()=>
                doubleTestBuilder(
                    singleStoreTests[curr[0]], 
                    singleStoreTests[curr[1]])),
            Promise.resolve());
    });
});

describe('Error testing', function(){
    it('mis spelled', function(){
    let kvStore = new RedKV();
    should.Throw(()=>{
        kvStore.addStore('missSpelled');
    });
    })
});

/*

describe('redkv with redis', function(){
    let kvStore = new RedKV();
    kvStore.addStore('redis');
    let key = 'testKey';

    before((done)=>{
        kvStore.delete(key)
            .then(()=>done());
    });

    after((done)=>{
        kvStore.delete(key)
            .then(()=>done());
    });

    it('kvStore only', function(done){
        kvStore.has(key)
            .then((val)=>{
                val=!!val;
                val.should.equal(false);
                return kvStore.set(key, '123');
            })
            .then(()=>kvStore.has(key))
            .then((val)=>{
                val=!!val;
                val.should.equal(true);
            })
            .then(()=>kvStore.get(key))
            .then(val=>{
                val.should.equal('123');
                return kvStore.delete(key);
            })
            .then(()=>{
                done();
            })
            .catch(err=>console.log(err));
    });
});

describe('redkv with dynamodb', function(){
    this.timeout(5000);
    let kvStore = new RedKV();
    kvStore.addStore('dynamodb', {
        region: "us-east-1",
        endpoint: process.env.DDB_ENDPOINT ||  "https://dynamodb.us-east-1.amazonaws.com",
        httpOptions: {
            timeout:3000
        },
        attributeName: Math.random().toString(36),
        tableName:  'dev.calculator'
    });

    let key = 'testKey';

    before((done)=>{
        kvStore.ready()
            .then(()=>kvStore.delete(key))
            .then(()=>done());
    });

    after((done)=>{
        kvStore.delete(key)
            .then(()=>done());
    });

    it('kvStore only', function(done){
        kvStore.has(key)
            .then((val)=>{
                val=!!val;
                val.should.equal(false);
                return kvStore.set(key, '123');
            })
            .then(()=>kvStore.has(key))
            .then((val)=>{
                val=!!val;
                val.should.equal(true);
            })
            .then(()=>kvStore.get(key))
            .then(val=>{
                val.should.equal('123');
                return kvStore.delete(key);
            })
            .then(()=>{
                done();
            })
            .catch(err=>console.log(err));
    });
});


describe('redkv with redis+dynamodb', function(){
    this.timeout(5000);

    let kvStore = new RedKV();
    kvStore.addStore('redis');
    kvStore.addStore('dynamodb', {
        region: "us-east-1",
        endpoint: "https://dynamodb.us-east-1.amazonaws.com",
        httpOptions: {
            timeout:3000
        },
        attributeName: Math.random().toString(36),
        tableName:  'dev.calculator'
    });

    let key = 'testKey';

    before((done)=>{
        kvStore.ready()
            .then(()=>kvStore.delete(key))
            .then(()=>done());
    });

    after((done)=>{
        kvStore.delete(key)
            .then(()=>done());
    });

    it('kvStore only', function(done){
        kvStore.has(key)
            .then((val)=>{
                val=!!val;
                val.should.equal(false);
                return kvStore.set(key, '123');
            })
            .then(()=>kvStore.has(key))
            .then((val)=>{
                val=!!val;
                val.should.equal(true);
            })
            .then(()=>kvStore.get(key))
            .then(val=>{
                val.should.equal('123');
                return kvStore.delete(key);
            })
            .then(()=>{
                done();
            })
            .catch(err=>console.log(err));
    });
});


describe('redis+dynamodb, redis lost', function(){
    let kvStore = new RedKV();
    let redis = kvStore.addStore('redis');
    let ddb = kvStore.addStore('dynamodb', {
        region: "us-east-1",
        endpoint: "https://dynamodb.us-east-1.amazonaws.com",
        httpOptions: {
            timeout:3000
        },
        attributeName: Math.random().toString(36),
        tableName:  'dev.calculator'
    });

    let key = 'testKey3';

    before((done)=>{
        kvStore.ready()
            .then(()=>kvStore.delete(key))
            .then(()=>done());
    });

    after((done)=>{
        kvStore.delete(key)
            .then(()=>done());
    });

    it('kvStore only', function(done){
        kvStore.has(key)
            .then((val)=>{
                val=!!val;
                val.should.equal(false);
                return kvStore.set(key, '123');
            })
            .then(()=>redis.delete(key))
            .then(()=>kvStore.has(key))
            .then((val)=>{
                val=!!val;
                val.should.equal(true);
                return redis.has(key);
            })
            .then(val=>{
                val=!!val;
                val.should.equal(false)
            })
            .then(()=>kvStore.get(key))
            .then(val=>{
                val.should.equal('123');
                return redis.get(key);
            })
            .then(val=>{
                val.should.equal('123');
                return kvStore.delete(key);
            })
            .then(()=>{
                done();
            })
            .catch(err=>console.log(err));
    });
});

describe('redis+ 2* dynamodb, redis lost', function(){
    let kvStore = new RedKV();
    let redis = kvStore.addStore('redis');
    let ddb = kvStore.addStore('dynamodb', {
        region: "us-east-1",
        endpoint: process.env.DDB_ENDPOINT || "https://dynamodb.us-east-1.amazonaws.com",
        httpOptions: {
            timeout:3000
        },
        attributeName: Math.random().toString(36),
        tableName:  'dev.calculator'
    });
    let ddb2 = kvStore.addStore('dynamodb', {
        region: "us-east-1",
        endpoint: process.env.DDB_ENDPOINT || "https://dynamodb.us-east-1.amazonaws.com",
        httpOptions: {
            timeout:3000
        },
        tableName:  'dev.calculator2',
        attributeName: Math.random().toString(36),
        attributeName: 'dearFox'
    });

    let key = 'testKey3';
    let keyNotExist = 'keyDoNotExist';

    before(function(done){
        kvStore.ready()
            .then(()=>kvStore.delete(key))
            .then(()=>kvStore.delete(keyNotExist))
            .then(()=>done())
            .catch(err=>console.log(err));
    });

    after(function(done){
        console.log('Tear down');
        kvStore.delete(key)
            .then(()=>kvStore.delete(keyNotExist))
            .then(()=>done())
            .catch(err=>console.log(err));
    });

    it('kvStore only', function(done){
        this.timeout(5000);
        kvStore.has(key)
            .then((val)=>{
                val=!!val;
                val.should.equal(false);
                return kvStore.set(key, '123');
            })
            .then(()=>redis.delete(key))
            .then(()=>kvStore.has(key))
            .then((val)=>{
                val=!!val;
                val.should.equal(true);
                return redis.has(key);
            })
            .then(val=>{
                val=!!val;
                val.should.equal(false)
            })
            .then(()=>kvStore.get(key))
            .then(val=>{
                val.should.equal('123');
                return redis.get(key);
            })
            .then(val=>{
                val.should.equal('123');
                return Promise.resolve();
            })
            .then(()=>kvStore.get(keyNotExist))
            .then(val=>{
                should.equal(val, null);
            })
            .then(()=>{
                console.log('done called');
                done();
            })
            .catch(err=>console.log(err));
    });

    it('zero value is not null', function(done) {
        kvStore.set(key, 0)
            .then(()=>kvStore.has(key))
            .then(val=>val.should.equal(true))
            .then(()=>kvStore.get(key))
            .then(val=>val.should.equal('0'))
            .then(()=>done())
            .catch(err=>console.log(err));
    });

    describe('redis+mongodb, redis lost', function(){
        let kvStore = new RedKV();
        let redis = kvStore.addStore('redis');
        let mongo = kvStore.addStore('mongodb');

        let key = 'testKey3';

        before((done)=>{
            kvStore.ready()
                .then(()=>kvStore.delete(key))
                .then(()=>done());
        });

        after((done)=>{
            kvStore.delete(key)
                .then(()=>done());
        });

        it('kvStore only', function(done){
            kvStore.has(key)
                .then((val)=>{
                    val=!!val;
                    val.should.equal(false);
                    return kvStore.set(key, '123');
                })
                .then(()=>redis.delete(key))
                .then(()=>kvStore.has(key))
                .then((val)=>{
                    val=!!val;
                    val.should.equal(true);
                    return redis.has(key);
                })
                .then(val=>{
                    val=!!val;
                    val.should.equal(false)
                })
                .then(()=>kvStore.get(key))
                .then(val=>{
                    val.should.equal('123');
                    return redis.get(key);
                })
                .then(val=>{
                    val.should.equal('123');
                    return kvStore.delete(key);
                })
                .then(()=>{
                    done();
                })
                .catch(err=>console.log(err));
        });
    });
});
*/
