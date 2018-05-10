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
                return store.delete(key);
            })
            .then(()=>{
                done();
            })
            .catch(err=>console.log(err))
        ;

    });
   /* 
    it('get/set/has with bluebird', function(done){
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
    */
});
