"use strict;"

const chai = require('chai');
const should = chai.should();
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

var randomString = function(){
    return  Math.random().toString(36).substring(7);
};

var testOneStore = function(store, key, value1, value2){
    key = key || randomString();
    value1 = value1 || randomString();
    value2 = value2 || randomString();
    let keyNotExist = randomString();

    return store.ready()
        .then(()=>store.delete(key))
        .then(()=>store.has(key))
        .then((val)=>{
            val=!!val;
            val.should.equal(false);
            return store.set(key, value1);
        })
        .then(()=>store.has(key))
        .then((val)=>{
            val=!!val;
            val.should.equal(true);
        })
        .then(()=>store.get(key))
        .then(val=>{
            val.should.equal(value1);
            // set the same key and see what happens
            return store.set(key, value2);
        })
        .then(()=>store.get(key))
        .then(val=>{
            val.should.equal(value2);
        })
        .then(()=>store.set(key, 0)) // number
        .then(()=>store.get(key))
        .then(val=>val.should.equal('0')) // gets a string
        .then(()=>store.set(key, 100)) // number
        .then(()=>store.get(key))
        .then(val=>val.should.equal('100')) // gets a string
        .then(()=>store.set(key, {}).should.be.rejected)
        .then(()=>store.set(key, {a:1}).should.be.rejected)
        .then(()=>store.set(key, []).should.be.rejected)
        .then(()=>store.set(key, undefined).should.be.rejected)
        .then(()=>store.set(key).should.be.rejected)
        .then(()=>store.set(key, null).should.be.rejected)
        .then(()=>store.set(undefined, 'valid').should.be.rejected)
        .then(()=>store.set(null, 'valid').should.be.rejected)
        .then(()=>store.set({}, 'valid').should.be.rejected)
        .then(()=>store.set({a:1}, 'valid').should.be.rejected)
        .then(()=>store.get(undefined).should.be.rejected)
        .then(()=>store.get(null).should.be.rejected)
        .then(()=>store.get({}).should.be.rejected)
        .then(()=>store.get({a:1}).should.be.rejected)
        .then(()=>store.has(undefined).should.be.rejected)
        .then(()=>store.has(null).should.be.rejected)
        .then(()=>store.has({}).should.be.rejected)
        .then(()=>store.has({a:1}).should.be.rejected)
        .then(()=>store.delete(undefined).should.be.rejected)
        .then(()=>store.delete(null).should.be.rejected)
        .then(()=>store.delete({}).should.be.rejected)
        .then(()=>store.delete({a:1}).should.be.rejected)
        .then(()=>store.delete(key))
        .then(()=>store.get(key))
        .then(valnull=>{
            should.equal(valnull, null);
            return store.has(key);
        })
        .then((val)=>{
            val.should.equal(false);
            return store.has(keyNotExist);
        })
        .then(val=>{
            should.equal(val, false);
            return store.get(keyNotExist);
        })
        .then(val=>{
            should.equal(val, null);
        });
};

var testTwoStores = function(store, subStore1, subStore2){
    let key = randomString();
    let value1 = randomString();
    return testOneStore(store)
        .then(()=>store.has(key))
        .then(val=>{
            val=!!val;
            val.should.equal(false);
        })
        .then(()=>store.set(key, value1))
        .then(()=>store.has(key))
        .then((val)=>{
            val=!!val;
            val.should.equal(true);
            return store.get(key);
        })
        .then(val=>{
            val.should.equal(value1)
            return subStore1.delete(key);
        })
        .then(()=>subStore1.has(key))
        .then((val)=>{
            val = !!val;
            val.should.equal(false);
        })
        .then(()=>store.has(key))
        .then((val)=>{
            val=!!val;
            val.should.equal(true);
            return store.get(key);
        })
        .then(val=>{
            val.should.equal(value1);
        })
        .then(()=>store.delete(key));
};

module.exports = {
    testOneStore:testOneStore,
    testTwoStores:testTwoStores
};

