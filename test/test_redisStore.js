const RedisStore =  require('../stores/redisStore');
const chai = require('chai');
const should = chai.should();

describe('redisStore basic', function(){
    let redis = new RedisStore();
    let key = 'testKey';

    before((done)=>{
        redis.delete(key)
            .then(()=>done())
            .catch(err=>console.log(err));
    });
    
    after((done)=>{
        redis.delete(key)
            .then(()=>done())
            .catch(err=>console.log(err));
    });

    it('get/set/has', function(done){
        redis.has(key)
            .then((val)=>{
                val=!!val;
                val.should.equal(false);
                return redis.set(key, '123');
            })
            .then(()=>redis.has(key))
            .then((val)=>{
                val=!!val;
                val.should.equal(true);
            })
            .then(()=>redis.get(key))
            .then(val=>{
                val.should.equal('123');
                return redis.delete(key);
            })
            .then(()=>{
                done();
            })
            .catch(err=>console.log(err))
        ;

    });
});
