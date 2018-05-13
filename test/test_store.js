"use strict;"

const chai = require('chai');
const should = chai.should();

var testOneStore = function(store, key, value1, value2){
    key = key || 'testKey';
    value1 = value1 || '123';
    value2 = value2 || 'abc';
    let keyNotExist = 'keyDoNotExist';

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
            return store.delete(key);
        })
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
    let key = 'testKey';
    let value1 = 'dfg';
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

