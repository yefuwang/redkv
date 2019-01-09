'use strict';

const RedKV = require('../index.js');
const chai = require('chai');
const should = chai.should();
const testStore = require('./test_store');

describe('issue3', function(){
	it('_id as key for mongo', function(){
		let kvStore = new RedKV();
		let be = kvStore .addStore('mongodb', {keyField:'_id'});
		return kvStore.ready()
			.then(()=>testStore.testOneStore(kvStore))
			.then(()=>testStore.testOneStore(be))
			.then(()=>console.log('<<<<Done testing issue3'));
	})
});

