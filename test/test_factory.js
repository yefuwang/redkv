require('dotenv').config();
const RedKV = require('../index.js');
const chai = require('chai');
const should = chai.should();

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
        endpoint: "https://dynamodb.us-east-1.amazonaws.com",
        httpOptions: {
            timeout:3000
        },
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
        endpoint: "https://dynamodb.us-east-1.amazonaws.com",
        httpOptions: {
            timeout:3000
        },
        tableName:  'dev.calculator'
    });
    let ddb2 = kvStore.addStore('dynamodb', {
        region: "us-east-1",
        endpoint: "https://dynamodb.us-east-1.amazonaws.com",
        httpOptions: {
            timeout:3000
        },
        tableName:  'dev.calculator2',
        attributeName: 'dearFox'
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
            })
            .then(()=>{
                done();
            })
            .catch(err=>console.log(err));
    });
});



