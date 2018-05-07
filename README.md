[![CircleCI](https://circleci.com/gh/yefuwang/redkv/tree/dev.svg?style=svg)](https://circleci.com/gh/yefuwang/redkv/tree/dev)  [![Coverage Status](https://coveralls.io/repos/github/yefuwang/redkv/badge.svg?branch=dev)](https://coveralls.io/github/yefuwang/redkv?branch=dev)

Redkv is a key-value store front end that can connect multiple key-value stores together as a list. A store appears earlier in the list works as a cache to the store later in the list. 

The reading and writing behaves as if it is a caching system. When writing to redkv, the key-value pair gets writtes to all key-value stores. When reading from it, readkv reads sequentially reads from the list of key-value stores until it find the key. After suceeded, it fills the failed stores in front of it. 

# Example

Let's create a redkv with a redis store at the front and a dynamodb store at the back end:

```javascript
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
```
We need to wait until all the store finishes initialization, which is when the `Promise` returned from `.ready()` resolves: 

```javascript
kvStore.ready().then(()=>{
    // Start using kvStore here
})

```

Now we can add key-value pairs to it:

```javascript
kvStore.set('mykey', 'my string value');
// Set function returns a promise which resolves when all the stores finish setting the key, which in this case are redis and dynamodb. 
```
We can also read from redkv using `.get(key)`

```javascript
kvStore.get('mykey')
    .then(value=>{
        // value should equal 'my string value'
    })
```
The API `.get(key)` will first try to read from the redis store. If succeeds, it resolve to the value found. If fails or the key does not exist in redis, it loads it from dynamodb, writes it back to redis, and returns a promise that resolves to the value found. 

# APIs

Redkv supports the following APIs. Except for the constructor, all APIs returns Promises. 

## constructor

```Javascript
let kvStore = new RedKV();
```

## .addStore

The addStore API adds a new store to redkv. 
```javascript
let kvStore = new RedKV();
//...
kvStore.addStore(storeName, options)
```
where `storeName` is a string name of the store, which can be `redis` or `dynamodb` at this time. The parameter `options` are the options passed to the individual stores. Please refer to the section of the individual stores for details. 

## .get:

The `get` API reads the value from the stores based on the key

```javascript
let kvStore = new RedKV();
//...
kvStore.get(key)
```
The key is expected to be a string. 

When there are multiple stores in redkv, the `get` API tries to get the key from the stores sequentially, until it finds the key in a store and gets it value. After that, it fills the key-value pair to all the stores before the store it succeeds. 

The stores are managed as as sequential list in the same order it is added into redkv. 

If none of the sores contains the key, the `get` API returns a `Promise` which will eventually resolve to `null`.

## set:

The `set` API writes the key-value pair to all the 

```javascript
let kvStore = new RedKV();
//...
kvStore.set(key, value)
```
Both the key and the value should be strings. 

The `set` API returns a promise which will resolve when all the stores sets the key-value pair succesfully, or rejects when one of the stores fails. 

## delete
The delete API deletes a key from all the stores. 
```javascript
let kvStore = new RedKV();
//...
kvStore.delete(key)
```

The `delete` API returns a `Promise` which resolves when all the stores finish deleting the key, or rejects when any sore fails to delete the key. 

## has
The has API returns a `Promise` that will resolve to a boolean value indicating if the key exists in one of the stores
```javascript
let kvStore = new RedKV();
//...
kvStore.delete(key)
    .then(exists=>{
        //exists is true when key exists in at least one store, 
        // and is false if it does not exist in any store
    })
```

# Stores

## redis
The redis store and be added to a redkv using `'redis'` as the parameter passed to the `addStore` API:

```javascript
let kvStore = new RedKV();
kvStore.addStore('redis', options);
```

The `options` object will be passed to [node_redis module](https://github.com/NodeRedis/node_redis). Please refer to redis document for details. 

## dynamodb
The dynamodb store and be added to a redkv using `'dynamodb'` as the parameter passed to the `addStore` API:

```javascript
let kvStore = new RedKV();
kvStore.addStore('dynamodb', options);
```
The `options` object will be passed to [dynamodb document client](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html). Please refer to dynamodb document client for details. 

In additional to the fields passed to dynamodb document client, the `options` object may contains the following additional fields:

### tableName
The `tableName` is your dynamodb table name. This field is required. 

### attributeName

Optional. If attributeName is set, redkv stores the value in an attribute with the name indicated by the `attributeName` field. If it is not set, it defaults to `'v'`.

The dynamodb table should contains only one hash key, and no partitional keys. 

# License

Redkv is released under MIT license. 
