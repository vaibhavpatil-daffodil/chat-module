var IO = require('socket.io');
var SocketIoRedis = require('socket.io-redis');
var lodash = require('lodash');
var dbUtils = require('../dbUtils');
var config = require('config');

// define module
var socket = {};
module.exports = socket;

//Socket io instance
var io = null;

//Existing namespaces
var namespaceMap = {};

/**
 * Initialize socket io for a given server instance
 * @param {http.Server} server - http server
 */
socket.setup = function(server){

  if (null == io) {
    io = IO(server);
		var redis_settings = config.get("redis");
    io.adapter(SocketIoRedis({ host: redis_settings.server, port: redis_settings.port }));
  }
};

/**
 * Get socket io instance for given namespace.
 * @param {String} namespace - socket io namespace
 */
socket.getIO = function(namespace) {

  // validate
  if(null === io){
    throw new Error("IO not initialized, ensure setup is called atleast once");
  }

  if(!lodash.isString(namespace)){
    throw new Error("namespace must be a string.");
  }

	// if(!lodash.isFunction(authFunc)){
	// 	throw new Error("authFunc must be a function.");
	// }
  // sanitize
  namespace = namespace.trim();

  // create on demand
  if(!lodash.has(namespaceMap,namespace)){
    namespaceMap[namespace] = io.of("/"+ namespace);
    //namespaceMap[namespace].use(authFunc);
  }
  return namespaceMap[namespace];
};
