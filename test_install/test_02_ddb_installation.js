'use strict';


const RedKV = require('../index');

const chai = require('chai');
const should = chai.should();
const testStore = require('../test/test_store');
const InputFilter = require('../storeInputFilter');
const fs = require('fs');
const exec = require('child_process').exec;

describe('aws-sdk needs to be installed', function(){
	this.timeout(1000000);
	before(function(done){
		const child = exec('npm uninstall aws-sdk -S',
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
		region: "us-east-1",
		endpoint: process.env.DDB_ENDPOINT || "https://dynamodb.us-east-1.amazonaws.com",
		httpOptions: {
			timeout:3000
		},
		tableName:  'dev.calculator',
		attributeName: Math.random().toString(36)
	};

	it('Exceptions', function(){
		should.Throw(()=>{
			let redkv = new RedKV();
			redkv.addStore('dynamodb', conf);
		});
	});

	it('install it', function(done){
		exec("npm install aws-sdk@^2.231.1 -S",
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
			//let redkv = new RedKV();
			//redkv.addStore('dynamodb', conf);
        require('../stores/dynamodbStore');
	});
});

