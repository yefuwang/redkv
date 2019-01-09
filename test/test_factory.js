'use strict';

require('dotenv').config();
const RedKV = require('../index.js');
const chai = require('chai');
const should = chai.should();
const testStore = require('./test_store');

//List of stores to test
const singleStoreTests = [
    {storeName: 'mongodb'}, // #0 
    {storeName: 'redis'},   // #1
    {storeName: 'dynamodb', options: { // #2
        region: "us-east-1",
        endpoint: process.env.DDB_ENDPOINT || "https://dynamodb.us-east-1.amazonaws.com",
        httpOptions: {
            timeout:3000
        },
        tableName:  'dev.calculator',
        attributeName: Math.random().toString(36)
    }},
    {storeName: 'mongodb', options: {collection:'StrangeCollection3'}}, // #3
    {storeName: 'mysql', options: {    //#4
        // DB created with: 
        // CREATE TABLE redkv (redk VARCHAR(256), redv TEXT, UNIQUE(redk));
        connectionLimit : 10,
        host : '127.0.0.1',
        user : 'redtester',
        password: 'redtesterpwd',
        database: 'redkv_test', 
        tableName: 'redkv',
        keyColumn: 'redk',
        valueColumn: 'redv'
    }},
    {storeName: 'postgres', options: { // #5
        host : '127.0.0.1',
        user : 'redkvtester',
        password: 'redtesterpwd',
        database: 'redkv_test', 
        tableName: 'redkv',
        keyColumn: 'redk',
        valueColumn: 'redv'
    }},
    {storeName: 'memory', options:{}}, // #6
    {storeName: 'sqlite', options:{path: '/tmp/b.sqlite'}},  // #7
    {storeName: 'mongodb', options: {collection:'c4', dbName:'my'}}, // #3
];

const singleTestBuilder = function(conf){
    console.log('>>>>Testing ' + conf.storeName );
    let kvStore = new RedKV();
    let backEnd = kvStore.addStore(conf.storeName, conf.options);
    return kvStore.ready()
        .then(()=>testStore.testOneStore(kvStore))
        .then(()=>testStore.testOneStore(backEnd))
        .then(()=>console.log('<<<<Done testing ' + conf.storeName));
};

const doubleTestBuilder = function(conf1, conf2){
    let testName =  conf1.storeName + ' '+conf2.storeName
    console.log('>>>>DoubleTesting ' + testName);
    let kvStore = new RedKV();
    let store1 = kvStore.addStore(conf1.storeName, conf1.options);
    let store2 = kvStore.addStore(conf2.storeName, conf2.options);
    return testStore.testTwoStores(kvStore, store1, store2)
        .then(()=>console.log('<<<<DoubleTesting ' +  testName));
};

describe('kvstore tests', function(){
    this.timeout(5000000);

    it('run all single tests', function(){
        return  singleStoreTests.reduce(
            (current, conf)=>{
                return current.then(()=>singleTestBuilder(conf))
            },
            Promise.resolve());
    });

    it('double tests', function(){
        // we will reuse the test definitions for single tests 
        // Pairs of indexes in array singleStoreTests
        let testPairs = [[1,0],[1,2],[0,2],[1,3],[2,3],[0,4],[1,4],
            [1,5], [3,5], [5, 3], [1, 6], [3, 6], [6, 3], [1, 7],
            [3, 7], [7, 3]];
        return testPairs.reduce(
            (accu, curr)=>accu.then(()=>
                doubleTestBuilder(
                    singleStoreTests[curr[0]], 
                    singleStoreTests[curr[1]])),
            Promise.resolve());
    });
});

describe('Error testing', function(){
    it('mis spelled', function(){
    let kvStore = new RedKV();
    should.Throw(()=>{
        kvStore.addStore('missSpelled');
    });
    })
});

