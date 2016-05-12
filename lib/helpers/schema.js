var db = require('../dbUtils').getMongoDB();


var onlineStatus = new db.Schema({
			userId: {type: Number, required: true},
			isOnline: {type: Boolean, default: false}
});

var chat = new db.Schema({
			adminId: {type: Number},
			participants: [{id:{type: Number},lastSeen:{type:Number},joinedOn:{type:Number}}],
			isGroup: {type: Boolean, required: true},
			title: {type: String},
			icon: {type:String}, //url of chat icon
			timestamp: {type:Number},
			createdOn: {type: Number, required: true}
});

var message = new db.Schema({
			text: {type: String, required: true},
			browserId: {type: String, required: true},
			file: {type: String},     //shared file url
			fromUserId: {type: Number, required: true}, //id of user who send message
			createdOn:	{type: Number},
			timestamp: 	{type: Number},
			chat: {type: db.Schema.Types.ObjectId,ref:'chat', required: true}
});

var schema = {};
module.exports = schema;

schema.onlineStatus = db.model('onlinestatus', onlineStatus);
schema.chat = db.model('chat', chat);
schema.message = db.model('message', message);
