var promiseChain = require('../lib/promiseChain');
let chai = require('chai');
let should = chai.should();

describe('promiseChain', function(){
    
    var p1=function(){
        return Promise.reject(1);
    };
    
    var p2=function(){
        return Promise.resolve(2);
    };

    it('first success', function(done){
        var arrp = [p1, p2];

        promiseChain.firstSuccess(arrp, function(a){return a();}) .then(val=>{
            val.should.equal(2);
            done();
        })
        .catch(err=> {
            console.log('err'+ err);
        })
        ;
    });
});