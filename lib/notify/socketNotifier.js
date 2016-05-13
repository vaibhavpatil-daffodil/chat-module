var socket = require('./socket');

// define module
var socketNotifier = {};
module.exports = socketNotifier;

/**
 * send notification to relevant socket Ids
 * @param {socket.io.namespace} namespace - namespace to be notified
 * @param {Array} socketIds - socket ids to be notified
 * @param {String} event_code - code of the event to be raised
 * @param {Object} event_code - payload to be sent
 */
socketNotifier.notify = function (namespace, socketIds, event_code, payload) {
  for (var i = 0; i < socketIds.length; i++) {
  		socket.getIO(namespace).to(socketIds[i]).emit(event_code, payload);
    }
};

/**
 * send notification to namespace
 * @param {socket.io.namespace} namespace - namespace to be notified
 * @param {String} event_code - code of the event to be raised
 * @param {Object} event_code - payload to be sent
 */
socketNotifier.notifyNamespace = function (namespace, event_code, payload) {
  socket.getIO(namespace).emit(event_code, payload);
};
