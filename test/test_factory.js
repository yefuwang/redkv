'use strict';

require('dotenv').config();
const RedKV = require('../index.js');
const chai = require('chai');
const should = chai.should();

describe('redkv with unknown db', function(){
    let kvStore = new RedKV();
    should.Throw(()=>{
        kvStore.addStore('missSpelled');
    });
});

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
});

