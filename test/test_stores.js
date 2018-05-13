
var testOnestore = function(store){
    let key = 'testKey';
    return store.has(key)
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
        });
};

var testTwoStores = function(store, subStore1, subStore2){

};

module.expors = {
    testOnestore:testOnestore,
    testTwoStores:testTwoStores
};