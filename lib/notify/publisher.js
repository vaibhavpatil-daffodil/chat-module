var api_events = require('../assets/api_events');
var async = require('async');
var lodash = require('lodash');
var socketNotifier = require('./socketNotifier');
var logger = require('../assets/logger');

// define module
var publisher = {};

//Handles chat related events
var chat = {};
publisher.chat = chat;

module.exports = publisher;


var helper =  null;

//Lazy load helpers
var helpers = function () {
  if (null == helper) {
      helper = require('../helpers');
  }
  return helper;
}

/**
 * Send socket notifications to users
 * @param {Array} userIds - users to be notified.
 * @param {socket.io.namespace} namespaces - targetted namespace
 * @param {String} event_code - event code
 * @param {object} payload - payload to be sent
 */

function notifySocket(userIds, namespace, event_code, payload){

  if (userIds == null) {
    socketNotifier.notifyNamespace(namespace, event_code, payload);
  }
  else {
    async.each(userIds, function(userId, done){
        helpers().socketHelper.getSockets(userId, namespace, function (err, userSockets) {
          console.log(userId,userSockets);
          if (err) {
            done(err);
          }
          else {
            if (userSockets && userSockets.length > 0) {
              socketNotifier.notify(namespace, userSockets, event_code, payload);
            }
            done();
          }
        });
      });
  }
}

/**
 * Send socket notification to users who are online on chat
 * @param {Number} user - user id to notify
 */
chat.userOnline = function (user, payload,namespace) {

  notifySocket([user.userId],namespace, api_events.chat_user_online.event_code, payload);
  return;
}

/**
 * Send socket notification to users who are online on chat
 * @param {Number} user - user id to notify
 */
chat.userOffine = function (user, payload, namespace) {
  user = (user && user.userId) ? [user.userId] : [];
  notifySocket(user, namespace, api_events.chat_user_offline.event_code, payload);
  return;
};

/**
 * Send socket notification to users added to new chat
 * @param {Number} userId - user ids to notify
 */
chat.newChat = function (chatId,namespace) {
  helpers().chatHelper.getChatInfo(chatId, function (err, result) {
    if (err) {
      logger.error("Unable to retrieve chat info while notifying");
    }
    else {
      var userIds = [];
      for (var i = 0; i < result.participants.length; i++) {
          userIds.push(result.participants[i].id);
      }
      notifySocket(userIds, namespace, api_events.chat_new.event_code, result);
    }
  });
  return;
};

/**
 * Send socket notification to users added to chat about new message
 * @param {Number} messageId - new messageId
 */
chat.newMessage = function (messageId,namespace) {
  helpers().chatHelper.getMessageInfo(messageId, function (err, result) {
    if (err) {
      logger.error("Unable to retrieve message info while notifying", err);
    }
    else {
      var userIds = [];
      for (var i = 0; i < result.chat.participants.length; i++) {
          userIds.push(result.chat.participants[i].id);
      }
      notifySocket(userIds, namespace, api_events.chat_new_message.event_code, result);
    }
  });
  return;
};

/**
 * Send socket notification to users added to chat about new participants
 * @param {Number} chatId - new messageId
 * @param {Number} new_participants - new messageId
 */
chat.newParticipants = function (chatId, namespace) {
  helpers().chatHelper.getChatInfo(chatId, function (err, result) {
    if (err) {
      logger.error("Unable to retrieve message info while notifying", err);
    }
    else {
      var userIds = [];
      for (var i = 0; i < result.participants.length; i++) {
          userIds.push(result.participants[i].id);
      }
      notifySocket(userIds, namespace, api_events.chat_new_participants.event_code, result);
    }
  });
  return;
};

/**
 * Send socket notification to users added to chat about removed participants
 * @param {Number} chatId - new messageId
 * @param {Number} participants - removed participants
 */
chat.removedParticipants = function (chatId, participants, namespace) {
  helpers().chatHelper.getChatInfo(chatId, function (err, result) {
    if (err) {
      logger.error("Unable to retrieve message info while notifying", err);
    }
    else {
      var userIds = [];
      for (var i = 0; i < result.participants.length; i++) {
          userIds.push(result.participants[i].id);
      }
      notifySocket(userIds, namespace, api_events.chat_removed_participants.event_code, result);
      notifySocket(participants, namespace, api_events.chat_removed_from.event_code, result);
    }
  });
  return;
};

/**
 * Send socket notification to users added to chat about removed participants
 * @param {Number} chatId - chat left by user
 * @param {Object} user_left - user object
 */
chat.leftChat = function (chatId, user_left,namespace) {
  helpers().chatHelper.getChatInfo(chatId, function (err, result) {
    if (err) {
      logger.error("Unable to retrieve message info while notifying", err);
    }
    else if(result){
      var userIds = [];
      for (var i = 0; i < result.participants.length; i++) {
          userIds.push(result.participants[i].id);
      }
      result.user_left = user_left;
      notifySocket(userIds,namespace, api_events.chat_left.event_code, result);
      notifySocket([user_left],namespace, api_events.chat_removed_from.event_code, result);
    }
  });
  return;
};
