'use strict';


const RedKV = require('../index');

const chai = require('chai');
const should = chai.should();
const testStore = require('../test/test_store');
const InputFilter = require('../storeInputFilter');
const fs = require('fs');
const exec = require('child_process').exec;

describe('mongodb needs to be installed', function(){
	this.timeout(1000000);
	before(function(done){
		const child = exec('npm uninstall mongodb -S',
			function (error, stdout, stderr) {
				console.log('stdout: ' + stdout);
				console.log('stderr: ' + stderr);
				if (error !== null) {
					console.log('exec error: ' + error);
				}
				done();
			});
	});

	it("mongodb not installed", function(){
		should.Throw(()=>{
			let redkv = new RedKV();
			redkv.addStore('mongodb', {collection:'StrangeCollection3'});
		});
	});

	it('install it', function(done){
		exec("npm install mongodb -S",
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
		require('../stores/mongodbStore');
	});
});

