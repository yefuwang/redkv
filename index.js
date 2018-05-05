const kvStoreFactory = require('./kvStoreFactory');

class RedKV {
    constructor(){
        this._stores=[];
    };

    addStore(storeName, options){
        let store = kvStoreFactory(storeName, options);
        this._stores.push(kvStoreFactory(storeName, options));
        return store;
    }

    ready() {
        return Promise.all(this._stores.map(x=>x.ready()));
    }

    set(key, value) {
        return Promise.all(this._stores.map(x=>x.set(key, value)));
    }

    get(key) {
        if(this._stores.length==0) {
            return Promise.reject();
        }

        let failedStores = [];
        
        // The promise to gets the value from the first store that succeeds
        let getAction = this._stores.reduce(
            function(promise, store, index) {
                return promise
                    .then(val=>{
                        if(val !== null) {
                            return val;
                        }
                        else {
                            if (index !=0) {
                                failedStores.push(index-1);
                            }
                            return store.get(key);
                        }
                    })
                    .catch(()=>{
                    if (index !=0) {
                        failedStores.push(index-1);
                    }
                    return store.get(key);
                })
            },
            Promise.reject()
        );

        // For all the stores that has failed, set them with the succeeded
        // value. 
        let value;
        let that = this;
        return getAction.then(val=>{
            value=val;
            return Promise.all(
                failedStores.map(x=>that._stores[x].set(key, value)));
        })
        .then(()=>value);
    }

    delete(key) {
        return Promise.all(this._stores.map(x=>x.delete(key)));
    }

    has(key) {
        if(this._stores.length===0) {
            console.log('No store configured');
            return Promise.resolve(false);
        }

        return this._stores.reduce( (promise, store)=>{
            return promise.then(found=>{
                if(found){
                    return true;
                }
                else {
                    return store.has(key);
                }

            })
        }, 
        Promise.resolve(false));
    }
};

module.exports = RedKV;
