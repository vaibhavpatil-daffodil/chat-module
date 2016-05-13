// define module
var chatNotifier = {};
module.exports = chatNotifier;

/**
 * Start chat namespace
 */
chatNotifier.init = function(namespace) {

	var helpers = require('../../helpers');
	var publisher = require('../publisher');
	var sockets = require('../socket');

	var chat = sockets.getIO(namespace);

	//Event to handle new socket connection
	chat.on('connection', function(socket) {

		var userId = socket.request._query.user_id;
		helpers.socketHelper.addSocket(userId, socket.id, namespace, function(err, result) {

			if (err) {
				throw new Error("Unable save new socket connection");
			} else if (result /*&& result.length == 1*/ ) {
				helpers.chatHelper.setUserOnlineStatus(userId, true, function(err, sos) {
					if (err) {
						throw new Error("Unable set user online on chat");
					} else {
						helpers.chatHelper.getOnlineUsers(userId, function(err, user) {
							if (err) {
								throw new Error("Unable set user online on chat");
							} else {
								publisher.chat.userOnline(user, sos, namespace);
							}
						});
					}
				});
			}
		});

		//Handle socket's disconnected event
		socket.on('disconnect', function() {
			helpers.socketHelper.removeSocket(userId, socket.id, namespace, function(err, result) {
				if (err) {
					throw new Error("Unable to remove socket id");
				} else if (!result || result.length == 0) {
					helpers.chatHelper.setUserOnlineStatus(userId, false, function(err, sos) {
						if (err) {
							throw new Error("Unable set user online on chat");
						} else {
							helpers.chatHelper.getOnlineUsers(userId, function(err, user) {
								if (err) {
									throw new Error("Unable set user online on chat");
								} else {
									publisher.chat.userOffine(user, sos, namespace);
								}
							});
						}
					});
				}
			});
		});
	});
	return helpers.chatHelper.createNamespace(namespace);
};
