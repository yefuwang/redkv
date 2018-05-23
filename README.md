[![CircleCI](https://circleci.com/gh/yefuwang/redkv/tree/dev.svg?style=svg)](https://circleci.com/gh/yefuwang/redkv/tree/master)  [![Coverage Status](https://coveralls.io/repos/github/yefuwang/redkv/badge.svg?branch=master)](https://coveralls.io/github/yefuwang/redkv?branch=master) [![bitHound Overall Score](https://www.bithound.io/github/yefuwang/redkv/badges/score.svg)](https://www.bithound.io/github/yefuwang/redkv)

RedKV is a key-value store interface for node.js which:

1. Provides a uniform key-value interface for a variety of SQL or NO-SQL databases
2. Connects to multiple databases possibly with different types

If multiple databases are configured, the reading and writing behave as if it is a caching system. When writing to RedKV, the key-value pair gets to write to all databases. When getting a key, RedKV sequentially tries a database from the front of the list, moves on to the next database if the key was not found, and stops until the key is found in a database. After that, the key-value pair is filled to all the databases in front of the list, up to the database where the key is actually found, just like filling a cache.

RedKV currently supports the following databases as its backend:

* [Redis](#redisstore)
* [DynamoDB](#dynamodbstore)
* [MongoDB](#mongodbstore)
* [MySQL](#mysqlstore)
* [PostgreSQL](#postgresstore)
* [Memory (everything in RAM)](#memorytore)

RedKV supports node.js version 6 and above. 

# Installation

Install with:

```Bash
npm i redkv
```

# Example

Let's create a RedKV with a Redis store at the front and a DynamoDB store at the back end:

```javascript
let kvStore = new RedKV();
kvStore.addStore('redis');
kvStore.addStore('dynamodb', {
        region: "us-east-1",
        endpoint: "https://DynamoDB.us-east-1.amazonaws.com",
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
// Set function returns a promise which resolves when all the stores finish setting the key, which in this case are redis and DynamoDB. 
```
We can also read from redkv using `.get(key)`

```javascript
kvStore.get('mykey')
    .then(value=>{
        // value should equal 'my string value'
    })
```
The API `.get(key)` will first try to read from the redis store. If succeeds, it resolves to the value found. If fails or the key does not exist in redis, it loads it from DynamoDB, writes it back to redis, and returns a promise that resolves to the value found. 

# APIs

RedKV supports the following APIs:

## `constructor`

```Javascript
let kvStore = new RedKV();
```

## `.addStore(storeName, option) => store`

The addStore API adds a new database (store) to redkv. 
```javascript
let kvStore = new RedKV();
//...
kvStore.addStore(storeName, options)
```
where `storeName` is a string name of the store, which can be one of the supported databases:`redis`, `DynamoDB`, `mongodb`, `mysq`, and `postgres`. Names of the databases are case-insensitive. The parameter `options` are the options passed to the individual stores. Please refer to the section of the individual databases (stores) for details. 

The `.addStore` API returns a store object that has the same API as the RedKV object itself, but points to only this store instead of a list of stores. 

## `.get(key) => Promise`

The `.get` API reads the value from the stores based on the key. If the key exists, it returns a promise which will resolve to a string value. Even if you set a number using the `.set` API, the value get the promise returned from the `.get` API will still be a string. See the `.set` API for more details. 

```javascript
let kvStore = new RedKV();
//...
kvStore.get(key)
```
The key should be a string. Numbers will be automatically converted to strings, other data types will cause this API to return a `Promise` that rejects. 

When there are multiple stores in RedKV, the `get` API tries to get the key from the stores sequentially, until it finds the key in a store `S1` and gets it value. After that, it fills the key-value pair to the stores before store `S1`. If none of the stores contains the key, the `get` API returns a `Promise` which will eventually resolve to `null`.

The stores are managed as a sequential list in the same order it is added into RedKV. 

For example, if a RedKV instance contains two stores with the `.addStore` API: a instance of Redos and a DynamoDB. When the `.get` API is called with a key, RedKV tries to find the key from Redis. If Redis contains the key, the `.get` API will return a promise that will eventually resolve to the value in Redis. If Redis does not have the key, RedKV will try to get the value from DynamoDB, fill the value into Redis, and return a Promise that resolves to the value. If neith Redis nor DynamoDB has the key, the `.get` API will return a Promise that resolves to `null`. 

## `.set(key, value) => Promise`

The `set` API writes the key-value pair to all stores in the RedKV instance. Both the key and the value are stored as strings. If the key or the value is a number, it will be converted to a string. Other non-string types, such as objects, `undefined`, or `null`, will cause this API to return a promise that rejects. 

```javascript
let kvStore = new RedKV();
//...
kvStore.set(key, value)
```

The `set` API returns a `Promise` which will resolve when all the stores set the key-value pair successfully or reject when one of the stores fails. 

## `.delete(key) => Promise`
The delete API deletes a key from all the stores. The `delete` API returns a `Promise` which resolves when all the stores finish deleting the key or rejects when any store fails to delete the key. 

```javascript
let kvStore = new RedKV();
//...
kvStore.delete(key)
```


## `.has(key) => Promise`
The has API returns a `Promise` that will resolve to a boolean value indicating if the key exists in one of the stores.
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

##  <a name="redisstore"></a>Redis
The Redis store can be added to a RedKV instance using `'redis'` as the parameter passed to the `addStore` API:

```javascript
let kvStore = new RedKV();
kvStore.addStore('redis', options);
```

The `options` object will be passed to [node_redis module](https://github.com/NodeRedis/node_redis). Please refer to node_redis document for details. 

## <a name="dynamodbstore"></a>Amazon DynamoDB
The DynamoDB store and be added to a RedKV using `'DynamoDB'` as the parameter passed to the `addStore` API:

```javascript
let kvStore = new RedKV();
kvStore.addStore('dynamodb', options);
```
The `options` object will be passed to [DynamoDB document client](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html). Please refer to DynamoDB document client for details. 

In addition to the fields passed to DynamoDB document client, the `options` object may contain the following additional fields:

### `tableName`
The `tableName` is your DynamoDB table name. This field is required. 

### `attributeName`

Optional. If attributeName is set, RedKV stores the value in an attribute with the name indicated by the `attributeName` field. If it is not set, it defaults to `'v'`.

The DynamoDB table should contain only one hash key and no partitional keys. 

## <a name="mongodbstore"></a>MongoDB
The MongoDB store can be added to a RedKV using `'mongodb'` as the parameter passed to the `addStore` API:

```javascript
let kvStore = new RedKV();
let options={url:'mongodb://localhost:27017'};
kvStore.addStore('mongodb', options);
```
`options` is an object. All fields are optional. Supported fields include `url`, `collection`, `keyField`, `valueField`. 

### `url`
The URL to the MongoDB instance. If not provided, a default value of `'mongodb://localhost:27017/redKV'` is assumed. 

### `collection`

The collection of MongoDB where the data will be stored. 
### `keyField`

The field in the collection which will be used to store keys. This field will be used to create a unique index. If omitted, it will default to `'redK'`. 

### `valueField`

The field in the collection which will be used to store values.  If omitted, it will default to `'redV'`. 


## <a name="mysqlstore"></a>MySQL

The MySQL store uses a table in a MySQL database for storing key-value pairs. 

Before using, you are responsible for creating the table in your database. An example is:

```SQL
CREATE TABLE redkv (redk VARCHAR(256), redv TEXT, UNIQUE(redk));
```
In this example, the table name is `redkv`. A column named `redk` is created with unique restrictions for storing the keys. A column named `redv` is created to store the values. You are of course free to adjust these names. However, the column needs to store the key needs to have UNIQUE restrictions. 

The configuration options need to be passed to the `.addStore` method of `RedKV`. The options including the name of the table, the column which will be used to store the key, and the column which will be used to store the values, and other parameters that are used to connect to the MySQL server,  Example:
```javascript
let kvStore = new RedKV();
let options = {
    //Parameters used by mysqljs
    connectionLimit : 10,
    host : '127.0.0.1',
    user : 'redtester',
    password: 'redtesterpwd',
    database: 'redkv_test', 
    //parameters used by RedKV to create the store
    tableName: 'redkv',
    keyColumn: 'redk',
    valueColumn: 'redv'
};
kvStore.addStore('mysql', options);
```
The MySQL store of RedKV uses three additional parameters on top of the other parameters supported by [mysqljs](https://github.com/mysqljs/mysql#pooling-connections): They are:

### `tableName`

Name of the table in the database to store the key-value pairs.

### `keyColumn`

Name of the column which will be used to store keys. 

### `valueColumn`

Name of the column which will be used to store values. 

## <a name="postgrestore"></a>PostgreSQL

The PostgreSQL store uses a table in a PostgreSQL database for storing key-value pairs. 

Before using, you are responsible of creating the table in your database. An example is:

```SQL
CREATE TABLE redkv (redk VARCHAR(256), redv TEXT, UNIQUE(redk));
```
In this example, the table name is `redkv`. A column named `redk` is created with unique restrictions for storing the keys. A column named `redv` is created to store the values. You are of course free to adjust these names. However, the column needs to store the key needs to have UNIQUE restrictions. 

The configuration options need to be passed to the .addStore method of RedKV. The options including the name of the table, the column which will be used to store the key, and the column which will be used to store the values, and other parameters that are used to connect to the PostgreSQL server, Example:
```javascript
let kvStore = new RedKV();
let options = {
    //Parameters used by node-postgres
    host : '127.0.0.1',
    user : 'redkvtester',
    password: 'redtesterpwd',
    database: 'redkv_test', 
    //parameters used by RedKV to create the store
    tableName: 'redkv',
    keyColumn: 'redk',
    valueColumn: 'redv'
};
kvStore.addStore('postgres', options);
```
The PostgreSQL store of RedKV uses three additional parameters on top of the other parameters supported by [node-postgres](https://node-postgres.com/features/connecting#programmatic): They are:

### `tableName`

Name of the table in the database to store the key-value pairs.

### `keyColumn`

Name of the column which will be used to store keys. 

### `valueColumn`

Name of the column which will be used to store values. 

## <a name="memorytore"></a>Memory

The memory database uses a simple Map as the backend, therefore everything is stored in memory. 

```javascript
let kvStore = new RedKV();
kvStore.addStore('memory', options);
```

# License

RedKV is released under MIT license. 
