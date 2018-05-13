'use strict';

const MongoDBStore =  require('../stores/mongodbStore');
const chai = require('chai');
const should = chai.should();

const testStore = require('./test_store.js');

describe('storeStore basic', function(){
    let store = new MongoDBStore();
    let store2 = new MongoDBStore({collection:'StrangeCollection3'});
    let key = 'testKey';

    before(()=>Promise.all([
        store.ready().then(()=>store.delete(key))
            .catch(err=>console.log(err)),
        store2.ready().then(()=>store2.delete(key))
            .catch(err=>console.log(err))
    ]));
    
    after((done)=>{
        store.delete(key)
            .then(()=>done())
            .catch(err=>console.log(err));
    });

    it('One mongodb', function(){
        return testStore.testOnestore(store);
    });

    it('Two mongodbs will not impact each other', function(){
        return Promise.all([testStore.testOnestore(store), testStore.testOnestore(store2)]);
    });
});

