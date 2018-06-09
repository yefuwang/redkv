'use strict';

require('../index');

const SQLiteStore =  require('../stores/sqliteStore');
const chai = require('chai');
const should = chai.should();
const testStore = require('./test_store');
const InputFilter = require('../storeInputFilter');
const fs = require('fs');

describe('MySQL Store Exception Handling', function(){

    let cleanUp = function(){
        try {
            fs.unlinkSync('/tmp/a.sqlite');
        }
        catch(err) {
        }
    };

    beforeEach(()=>cleanUp());
    afterEach(()=>cleanUp());

    it('Exceptions', function(){
        should.Throw(()=>{
            new SQLiteStore();
        });
        should.Throw(()=>{
            new SQLiteStore({ } );
        });
        should.Throw(()=>{
            new SQLiteStore({tableName: 'abc' } );
        });
        should.Throw(()=>{
            new SQLiteStore({tableName: 'abc', keyColumn: 'c'} );
        });
    });

    it('Non default tableName', function(){
        let mysql = new SQLiteStore({
            path: '/tmp/a.sqlite',
            tableName: 'redkv_2',
        } );
        return testStore.testOneStore(new InputFilter(mysql));
    });

    it('Non default keyColumn', function(){
        let mysql = new SQLiteStore({
            path: '/tmp/a.sqlite',
            keyColumn: 'strangeKey',
        } );
        return testStore.testOneStore(new InputFilter(mysql));
    });
    
    it('Non default valueColumn', function(){
        let mysql = new SQLiteStore({
            path: '/tmp/a.sqlite',
            valueColumn: 'strangeValue',
        } );
        return testStore.testOneStore(new InputFilter(mysql));
    });
});

