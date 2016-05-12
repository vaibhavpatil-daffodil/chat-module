var publisher = require('../notify/publisher');
var lodash = require('lodash');
var db = require('./schema');


/**
 * Utility to perform multiple operations on room.
 * @param namespace value to rooom.
 * @constructor
 */
function room(namespace){
		this.namespace = namespace;
}

/**
 * Creates a new room instance for given namespace.
 * @param namespace for room.
 * @returns {room}
 */
room.createNamespace = function (namespace) {
    return new room(namespace);
};

module.exports = room;
/**
 * Get active chats of a user
 * @param {Number} userId - user id
 */
room.getOnlineUsers = function(userId,callback) {
		db.onlineStatus.findOne({userId:userId,isOnline:true},callback);
};

/**
 * Set user online on chat
 * @param {Number} userId - user id
 */
room.setUserOnlineStatus = function(userId,status,callback) {
		var data = {isOnline : status};
		db.onlineStatus.findOneAndUpdate({userId: userId},{$set: data},{upsert:true},callback);
};

/**
 * Get chat by id for a user
 * @param {Number} chatId - chat id
 */
room.getChatInfo = function(chatId,callback){
		db.chat.findOne({_id:chatId},callback);
}

/**
 * Get message by id for a user
 * @param {Number} messageId - message id
 */
room.getMessageInfo = function(messageId,callback){
	db.message.findOne({_id:messageId}).populate('chat').exec(callback);
};
/**
 * Initiate chat if there is already a private chat going that instance will be returned
 * @param {Number} initiatorId - initiator id
 * @param {Number} reciverId - reciver id
 * @param {function(Error,Object)} callback - callback function.
 */
room.prototype.initiateChat = function(initiatorId, reciverId, callback) {

		var condition = {isGroup: false, 'participants.id': {$all: [initiatorId,reciverId]}};
		var namespace = this.namespace;
		db.chat.findOne(condition, function(err,result){
			if(err){
				throw err;
			}else if(result) {
				callback(null,result);
			}else {
				var time = Date.now();
				var data = new db.chat({
					participants: [{id:initiatorId,lastSeen:time,joinedOn:time},{id:reciverId,lastSeen:0,joinedOn:time}],
					isGroup: false,
					createdOn: time,
					timestamp: time
				});

				data.save(function(err,doc){
					if(err){
						throw err;
					}else{
						callback(null,doc);
						publisher.chat.newChat(doc._id, namespace);
					}
				});
			}
		});
};

room.prototype.newMessage = function(chatId,fromUserId,browserId,message,callback){
	var namespace = this.namespace;
	db.chat.findOne({_id:chatId,'participants.id':{$in:[fromUserId]}},function(err,chat){
		if(err){
			throw err;
		}else if(chat){
			var time = Date.now();
			var data = {
				text: message.text,
				chat: chatId,
				fromUserId: fromUserId,
				createdOn: time,
				timestamp: time,
				browserId: browserId
			}

			if(message.file){
				data.file = message.file;
			}

			new db.message(data).save(function(err,doc){
				if(err){
					throw err;
				}else{
					callback(null,doc);
					db.chat.update({_id:chatId,'participants.id':fromUserId},{$set:{'participants.$.lastSeen':time,timestamp:time}}).exec()
					publisher.chat.newMessage(doc._id,namespace);
				}
			});
		}else{
			callback("User is not participant of this chat",null);
		}
	});
};

/**
 * Initiate group chat if there is already a group chat going that instance will be returned
 * @param {Number} initiatorId - initiator id
 * @param {Array} participants - participants id
 * @param {String} title - group title
 * @param {function(Error,Object)} callback - callback function.
 */
room.prototype.initiateGroupChat = function(initiatorId, participants, title, icon, callback) {

		var title = title.trim();

		if(!(title || title.length)){
			callback('Title is missing for initiate group',null);
		}else {
			var namespace = this.namespace;
			db.chat.findOne({title:new RegExp(title,'i'),adminId:initiatorId},function(err,doc){
				if(err){
					throw err;
				}else if(doc){
					callback('Title already exists for this admin',null);
				}else{
					participants.push(initiatorId);
					var time = Date.now();
					participants = participants.map(function(v){return{id:v,lastSeen:0,joinedOn:time}});

					var data = new db.chat({
							adminId: initiatorId,
							participants: participants,
							isGroup: true,
							title: title,
							createdOn: time,
							timestamp: time,
							icon: (icon && icon.length) ? icon : undefined
						});

					data.save(function(err,doc){
						if(err){
							throw err;
						}else{
							callback(null,doc);							
							publisher.chat.newChat(doc._id, namespace);
						}
					});
				}
			});
		}
};


/**
 * add participant in group.
 * @param {String} chatId - chat id.
 * @param {Number} userId - user id.
 * @param {Array} participants - participants id.
 * @param {function(Error,Object)} callback - callback function.
 */
 room.prototype.addParticipants = function(chatId, userId, participants, callback){
	 var namespace = this.namespace;
	 db.chat.findOne({_id:chatId, isGroup:true, 'participants.id':{$in:[userId]}},function(err,doc){
		 if(err){
			 throw err;
		 }else if(!doc){
			 callback('This chat is not a group OR You are not a member of this group.',null);
		 }else{

			 var time = Date.now();
			 var members = doc.participants.map(function(p){return p.id});
			 var newParticipants = [];
			 var alreadyparticipants =[];

			 for(var index = 0; index < participants.length; index++){

					 if(members.indexOf(participants[index]) > -1) {
							 alreadyparticipants.push(participants[index]);
					 }else {
					 		newParticipants.push({id:participants[index],lastSeen:0,joinedOn:time});
					 }
			 }

			 if(alreadyparticipants.length){
				 callback('User '+alreadyparticipants.join(',')+' already member of this group',null);
			 }else {
				 doc.participants.map(function(p,index){
					 if(p.id == userId){
						 p.lastSeen = time;
					 }
				 });
				 doc.participants = doc.participants.concat(newParticipants);

					db.chat.findOneAndUpdate({_id:chatId},{timestamp:time,$set:{participants:doc.participants}},{new:true},callback);
					publisher.chat.newParticipants(chatId, namespace);
			 }
		 }
	 });
 };

 /**
  * Remove users from group
  * @param {Number} userId - user id
  * @param {Number} chatId - chat id
  * @param {Array} participants - chat id
  */
 room.prototype.removeParticipants = function(chatId, userId, participants, callback) {
	 var namespace = this.namespace;
	 db.chat.findOne({_id:chatId, isGroup:true, adminId:userId},function(err,doc){
		 if(err){
			 throw err;
		 }else if(!doc){
			 callback('You are not admin of this group.',null);
		 }else{
					var time = Date.now();
					var removeParticipants = doc.participants.filter(function(p){
								if(p.id == userId) {
									p.lastSeen = time;
								}
						 		if(!(participants.indexOf(p.id) > -1)) {
									return p;
								}
					 });

					db.chat.findOneAndUpdate({_id:chatId},{timestamp:time,$set:{participants:removeParticipants}},{new:true},callback);
					publisher.chat.removedParticipants(chatId, participants, namespace);
		 }
	});
 };

 /**
  * Get chat by id for a user
  * @param {Number} userId - user id
  * @param {Number} chatId - chat id
  */
 room.prototype.getChat = function(chatId, userId, callback) {
		db.chat.findOneAndUpdate({_id:chatId,'participants.id':userId},
						{$set:{'participants.$.lastSeen':Date.now()}},{new:true},callback);
 };

 /**
  * Get messages of chat id for a user
  * @param {Number} userId - user id
  * @param {Number} chatId - chat id
  * @param {Number} limit - limit records
  * @param {Number} skip - skip records
  */
 room.prototype.getChatMessages = function(chatId, userId, skip, limit, callback) {
	 db.chat.findOneAndUpdate({_id:chatId,'participants.id':userId},{$set:{'participants.$.lastSeen':Date.now()}},{new:true},
 			function(err,doc){
				if (err) {
					throw err;
				}else if(doc){
						var join = doc.participants.filter(function(p){return p.id == userId;})[0];
						db.message.find({chat:chatId}).skip(skip).limit(limit).sort({timestamp : -1}).exec(callback);
				}else{
					callback(null,[]);
				}
			});
 };

 /**
 * Update chat info
 * @param {Number} chatId - chat id
 * @param {Number} userId - user id
 * @param {String} title - chat title
 * @param {Number} icon - chat icon url
 */
room.prototype.updateChat = function(chatId, userId, title, icon, callback) {
	var title = title.trim();

	if(!(title || title.length)){
		callback('Title is missing',null);
	}else {
		db.chat.findOne({title:new RegExp(title,'i')},function(err,doc){
			if(err){
				throw err;
			}else if(doc){
				callback('Title already exists',null);
			}else {
				var data = {
					title: title,
					$set:{'participants.$.lastSeen':Date.now()}
				}

				if(icon && icon.length){
					data.icon = icon;
				}

				db.chat.findOneAndUpdate({_id:chatId, isGroup:true, 'participants.id':userId},data,{new:true},callback);
			}
		});
	}
};

/**
 * Leave a on going chat
 * @param {Number} userId - user id
 * @param {Number} chatId - chat id
 */
room.prototype.leaveChat = function(chatId, userId, callback) {
	var namespace = this.namespace;
	db.chat.findOneAndUpdate({_id:chatId,'participants.id':userId},{ $pull: {"participants": {id: userId}},timestamp:Date.now()},{new:true},function(err,doc){
		if (err) {
			throw err;
		}else if(doc){

			if (!doc.participants.length){
				db.chat.remove({_id:chatId},callback);
			}else if(userId == doc.adminId){
					var newAdmin = doc.participants.sort(function(x, y){ return x.joinedOn - y.joinedOn})[0];
					db.chat.findOneAndUpdate({_id:chatId},{$set:{adminId:newAdmin.id}},{new:true},callback);
				}else {
				callback(err,doc);
			}
			publisher.chat.leftChat(chatId,userId,namespace);
		}else{
			callback(null,null);
		}
	})

};

/**
 * Get active chats of a user
 * @param {Number} userId - user id
 */
room.prototype.getChats = function(userId, callback) {

	var chats = [];
	db.chat.find({'participants.id':{$in:[userId]}}).sort({createdOn:-1}).exec(function(err,doc){
		if (err) {
			throw err;
		}else if(doc && doc.length){
			var chats = [];
			doc.forEach(function(c,i){

				db.message.findOne({chat : c._id}).sort({createdOn:-1}).exec(function(error,msg){
					var u = c.participants.filter(function(p){return p.id == userId})[0];

					db.message.count({chat:c._id,fromUserId:{$ne:userId},
											$and:[{createdOn:{$gte:u.lastSeen}},{createdOn:{$gte:u.joinedOn}}]},function(e,unread){
						chats.push({chat:c,lastMessage:msg,unread:unread});
						if(i == doc.length-1){
							callback(null,chats);
						}
					})
				});
			});
		}
	});
};
