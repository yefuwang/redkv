'use strict';

const MongoDBStore =  require('../stores/mongodbStore');
const chai = require('chai');
const should = chai.should();

describe('storeStore basic', function(){
    let store = new MongoDBStore();
    let store2 = new MongoDBStore({collection:'StrangeCollection3'});
    let key = 'testKey';

    before(()=>Promise.all([
        store.ready().then(()=>store.delete(key))
            .catch(err=>console.log(err)),
        store2.ready().then(()=>store2.delete(key))
            .catch(err=>console.log(err))
        ]
    ));
    
    after((done)=>{
        done();
        return;
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
        store2.ready()
            .then(()=>store.set(key)) // set it in store will not impact store2
            .then(()=>store2.has(key))
            .then((val)=>{
                console.log('Val is : ' + val);
                val=!!val;
                val.should.equal(false);
                return store2.set(key, '123');
            })
            .then(()=>store2.has(key))
            .then((val)=>{
                val=!!val;
                val.should.equal(true);
            })
            .then(()=>store2.get(key))
            .then(val=>{
                val.should.equal('123');
                return store2.delete(key);
            })
            .then(()=>{
                done();
            })
            .catch(err=>console.log(err))
        ;

    });
});

