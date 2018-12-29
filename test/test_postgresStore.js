'use strict';

const Store =  require('../stores/postgresStore');
const chai = require('chai');
const should = chai.should();
const testStore = require('./test_store');

describe('Postgres Store Exception Handling', function(){
	it('Exceptions', function(){
		should.Throw(()=>{
			new Store();
		});
		should.Throw(()=>{
			new Store({ } );
		});
		should.Throw(()=>{
			new Store({tableName: 'abc' } );
		});
		should.Throw(()=>{
			new Store({tableName: 'abc', keyColumn: 'c'} );
		});
	});
});
