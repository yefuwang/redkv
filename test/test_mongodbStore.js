'use strict';

const MongoDBStore =  require('../stores/mongodbStore');
const chai = require('chai');
const should = chai.should();

describe('storeStore basic', function(){
    let store = new MongoDBStore();
    let key = 'testKey';

    before((done)=>{
        store.ready().then(()=>store.delete(key))
            .then(()=>done())
            .catch(err=>console.log(err));
    });
    
    after((done)=>{
        store.delete(key)
            .then(()=>done())
            .catch(err=>console.log(err));
    });

    it('get/set/has', function(done){
        store.has(key)
            .then((val)=>{
                val=!!val;
                val.should.equal(false);
                return store.set(key, '123');
            })
            .then(()=>store.has(key))
            .then((val)=>{
                val=!!val;
                val.should.equal(true);
            })
            .then(()=>store.get(key))
            .then(val=>{
                val.should.equal('123');
                // set the same key and see what happens
                return store.set(key, 'abc');
            })
            .then(()=>store.get(key))
            .then(val=>{
                val.should.equal('abc');
                return store.delete(key);
            })
            .then(()=>{
                done();
            })
            .catch(err=>console.log(err))
        ;

    });

    it('custom ', function(done){
        let store = new MongoDBStore({useBlueBird: true});
        store.has(key)
            .then((val)=>{
                val=!!val;
                val.should.equal(false);
                return store.set(key, '123');
            })
            .then(()=>store.has(key))
            .then((val)=>{
                val=!!val;
                val.should.equal(true);
            })
            .then(()=>store.get(key))
            .then(val=>{
                val.should.equal('123');
                return store.delete(key);
            })
            .then(()=>{
                done();
            })
            .catch(err=>console.log(err))
        ;

    });
});
