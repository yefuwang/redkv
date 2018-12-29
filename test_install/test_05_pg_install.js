'use strict';


const RedKV = require('../index');

const chai = require('chai');
const should = chai.should();
const testStore = require('../test/test_store');
const InputFilter = require('../storeInputFilter');
const fs = require('fs');
const exec = require('child_process').exec;

describe('pg needs to be installed', function(){
	this.timeout(1000000);
	before(function(done){
		const child = exec('npm uninstall pg -S',
			function (error, stdout, stderr) {
				console.log('stdout: ' + stdout);
				console.log('stderr: ' + stderr);
				if (error !== null) {
					console.log('exec error: ' + error);
				}
				done();
			});
	});

	let conf={
		host : '127.0.0.1',
		user : 'redkvtester',
		password: 'redtesterpwd',
		database: 'redkv_test', 
		tableName: 'redkv',
		keyColumn: 'redk',
		valueColumn: 'redv'
	};

	it('Exceptions', function(){
		should.Throw(()=>{
			let redkv = new RedKV();
			redkv.addStore('postgres', conf);
		});
	});

	it('install it', function(done){
		exec("npm install pg -S",
			function (error, stdout, stderr) {
				console.log('stdout: ' + stdout);
				console.log('stderr: ' + stderr);
				if (error !== null) {
					console.log('exec error: ' + error);
				}
				done();
			});
	});

	it('Good after installation', function(){
		require('../stores/postgresStore');
	});
});

