'use strict';

// OptionalDependency must be initialized before any stores are
// initiazlied. Otherwise, the stores requiring an optional dependnecy
// will not have a correct error message printed.
// Therefore it is better to do it at the very beginning.
require('./optionalDependency').setRoot(module);

const kvStoreFactory = require('./kvStoreFactory');

class RedKV {
    constructor(){
        this._stores=[];
        this._resolved = Promise.resolve();
        this._knownReady = false;
    }

    addStore(storeName, options){
        this._knownReady = false;
        let store = kvStoreFactory.build(storeName, options);
        this._stores.push(store);
        return store;
    }

    ready() {
        if (this._knownReady) {
            // avoid reconstructing a promise every time. 
            return this._resolved;
        }

        let that = this;
        return Promise.all(this._stores.map(x=>x.ready()))
            .then(()=>{that._knownReady = true;});
    }

    set(key, value) {
        return this.ready().then(()=>Promise.all(this._stores.map(x=>x.set(key, value))));
    }

    get(key) {
        if(this._stores.length === 0) {
            return Promise.reject();
        }

        let failedStores = [];
        
        // The promise to gets the value from the first store that succeeds
        let getAction = this.ready().then(()=>{
            return this._stores.reduce(
                function(promise, store, index) {
                    return promise
                        .then(val=>{
                            if(val !== null && val !== undefined) {
                                return val;
                            }
                            else {
                                if (index !==0) {
                                    failedStores.push(index-1);
                                }
                                return store.get(key);
                            }
                        })
                        .catch(()=>{
                            if (index !==0) {
                                failedStores.push(index-1);
                            }
                            return store.get(key);
                        })
                },
                Promise.reject()
            );
            
        });

        // For all the stores that has failed, set them with the succeeded
        // value. 
        let value;
        let that = this;
        return getAction.then(val=>{
            value=val;
            if(value === undefined || value === null){
                return Promise.resolve(value);
            }
            else {
                return Promise.all(
                    failedStores.map(
                        x=>that._stores[x].set(key, value)));
            }
        })
        .then(()=>value);
    }

    delete(key) {
        let that = this;
        return this.ready().then(()=>
            Promise.all(that._stores.map(x=>x.delete(key))));
    }

    has(key) {
        if(this._stores.length===0) {
            return Promise.resolve(false);
        }

        let that = this;

        return this.ready().then(()=>
            that._stores.reduce( (promise, store)=>{
                return promise.then(found=>{
                    if(found){
                        return true;
                    }
                    else {
                        return store.has(key);
                    }

                });
            }, 
            Promise.resolve(false)));
    }
}

module.exports = RedKV;
