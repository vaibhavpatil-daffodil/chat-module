var db = require('../dbUtils').getRedisDB();
var lodash = require('lodash');
var socket = require('../notify/socket');

//Create module
var helper = {};
module.exports = helper;

/**
 * Get list of user's active sockets
 * @param {Number} userId - Id of user
 * @param {function(Error,Object)} callback - callback function.
 */
helper.getSockets = function(userId, namespace, callback) {
  db.get(namespace + '_' + userId, function(err, result) {
      if (err) {
        callback(err);
      } else {
        var sockets = result && result != null ? JSON.parse(result) : [];
        var refreshedSockets = [];
        var channel = socket.getIO(namespace);
        for (var i = 0; i < sockets.length; i++) {
          if (channel.connected[sockets[i]] != undefined &&
                channel.connected[sockets[i]].connected) {
            refreshedSockets.push(sockets[i]);
          }
        }

        callback(null, refreshedSockets);
      }
    });
};

/**
 * Get list of user's active sockets
 * @param {Number} userId - Id of user
 * @param {String} socketId - User's unique socket id
 * @param {function(Error,Object)} callback - callback function.
 */
helper.addSocket = function(userId, socketId, namespace, callback) {
  helper.getSockets(userId, namespace, function(err, sockets) {
      if (err) {
        callback(err);
      } else {
        if (sockets == null) {
          sockets = [];
        }

        sockets = lodash.union(sockets, [socketId]);
        db.set(namespace + '_' + userId, JSON.stringify(sockets), function(err, result) {
          if (err) {
            callback(err);
          } else {
            callback(null, sockets);
          }
        });
      }
    });
};

/**
 * Remove socket
 * @param {Number} userId - Id of user
 * @param {String} socketId - User's unique socket id
 * @param {function(Error,Object)} callback - callback function.
 */
helper.removeSocket = function(userId, socketId, namespace, callback) {
  helper.getSockets(userId, namespace, function(err, sockets) {
      if (err) {
        callback(err);
      } else {
        if (sockets == null || sockets.length == 0) {
          callback(null, null);
        } else {
          var refreshedSockets = [];
          for (var i = 0; i < sockets.length; i++) {
            if (sockets[i] != socketId) {
              refreshedSockets.push(sockets[i]);
            }
          }

          db.set(namespace + '_' + userId, JSON.stringify(refreshedSockets), function(err, result) {
            if (err) {
              callback(err);
            } else {
              callback(null, refreshedSockets);
            }
          });
        }
      }
    });
};
