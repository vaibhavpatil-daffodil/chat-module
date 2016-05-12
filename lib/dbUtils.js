var redis = require('redis');
var config = require('config');
var mongoose = require('mongoose');

// define module
var dbUtils = {};
module.exports = dbUtils;

var redisConf = config.get("redis");
var redisDB = redis.createClient(redisConf.port, redisConf.server, redisConf.options);

var mongoConf = config.get("mongo");
mongoose.connect(mongoConf.uri, mongoConf.options);

/**
 * Returns Redis DB driver instance
 * @return {redisDB}
 */
dbUtils.getRedisDB = function(){
    return redisDB;
};

/**
 * Returns Mongo DB driver instance
 * @return {mongoose}
 */
dbUtils.getMongoDB = function(){
    return mongoose;
};
