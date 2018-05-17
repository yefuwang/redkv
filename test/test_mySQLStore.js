'use strict';

const MySQLStore =  require('../stores/mySQLStore');
const chai = require('chai');
const should = chai.should();
const testStore = require('./test_store');
const InputFilter = require('../storeInputFilter');

describe('MySQL Store Exception Handling', function(){
    it('Exceptions', function(){
        should.Throw(()=>{
            new MySQLStore();
        });
        should.Throw(()=>{
            new MySQLStore({ } );
        });
        should.Throw(()=>{
            new MySQLStore({tableName: 'abc' } );
        });
        should.Throw(()=>{
            new MySQLStore({tableName: 'abc', keyColumn: 'c'} );
        });
    });
    it('force bluebird', function(){
        let mysql = new MySQLStore({
            useBlueBird: true,
            connectionLimit : 10,
            host : '127.0.0.1',
            user : 'redtester',
            password: 'redtesterpwd',
            database: 'redkv_test', 
            tableName: 'redkv',
            keyColumn: 'redk',
            valueColumn: 'redv'
        } );

        return testStore.testOneStore(new InputFilter(mysql));
    });
});
