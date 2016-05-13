
## Chat-Module

  Chat module is independent module for chatting, you have no need to save your messages in anywhere, this module
	automatically done this.

## install
		npm install chat-module

## Events for chats
 	 * Below are the events that needs to understand for using this module - 	 
	 		1. CHAT_USER_ONLINE - this event fire when any user reached online.
			2. CHAT_USER_OFFLINE - this event fire when any user reached offline.
			3. CHAT_NEW - this event is fire when a user wants to chat with new user that he haven't chat before.
			4. CHAT_NEW_MESSAGE - this event is fire whenever a new message sent.
			5. CHAT_NEW_PARTICIPANTS - this event is fire when a new participant added into group chat.
			6. CHAT_REMOVED_PARTICIPANTS - this event is fire when an existing user removed from group chat.
			7. CHAT_REMOVED_FROM - this event fire to user who removed from group chat.
			8. CHAT_LEFT - this event fire when user left chat by himself.


## Set user id in request query while connecting socket from front-end, so it can set particular user socket.
		Ex.-

		io.connect('http://localhost:9980/chatroom', {
      query: 'user_id=' + userId
      });

	Here "/chatroom" is the namespace for chat.

## Setup chat

		* Create a folder name config in your root directory.
		* Create a file in config folder name default.json.
		* Set redisdb and mongodb configuration in json file as
				{
					"redis": {
							"server": "",
							"port": "",
							"options": {}
						},
						"mongo" : {
							 "uri": "",
							 "options": {}
						 }
				}

	```js

	var chat = require('chat');
	chat.setup(server);

	server : node server.

	```

## Initialize chat with namespace		

		```js
		var chat = require('chat');
		var room = chat.init(namespace);

		```

		* Init method has one parameters.

		1. namespace: namespace for start chat.		


-----------------------------------------room instance have following functions-----------------------

## Initiate private chat

		```js

		room.initiateChat(initiatorId,reciverId,callback);

		```
		* Method has three parameters.

		1. initiatorId: id of user who want to chat.
		2. reciverId: id of user to whom wants to chat.
		3. callback function.

## Initiate group chat
	```js

	room.initiateGroupChat(initiatorId, participants, title, icon, callback);

	```
	* Method has four parameters.

	1. initiatorId: id of user who creates group.
	2. participants: array of user ids wants to added in group.
	3. title: title for group.
	4. icon: url for group image icon.(optional)
	5. callback: callback function.

## Post message on chat

		```js

		room.newMessage(chatId,fromUserId,browserId,message,callback);

		```
		* Method has four parameters.

		1. chatId : chat id (mongo id) in which user wants to chat either private or group chat.
		2. fromUserId : user id who send message.
		3. message : object
				ex. message = {
					text: 'hi this is new message', // required field
					file: 'url of shared file'      // optional field
				}
		4. browserId: unique id of browser.		
		5. callback function.

## Add participants in group chat (any member in group can add new participant)
			```js

			room.addParticipants(chatId,userId,participants,callback)

			```
			* Method has four parameters.

			1. chatId : chat id (mongo id) in which user wants to add participants.
			2. userId :	user id who wants to add participants.
			3. participants : array of user ids.
			4. callback function.

## Remove participants from group chat (only admin can remove participant from group)
			```js

			room.removeParticipants(chatId,userId,participants,callback)

			```
			* Method has four parameters.

			1. chatId : chat id (mongo id) in which user wants to remove participants.
			2. userId :	id of group admin.
			3. participants : array of user ids.
			4. callback function.

## Get chat by id
			```js

			room.getChat(chatId,userId,callback);

			```
			* Method has three parameters.

			1. chatId : chat id (mongo id) user wants to get.
			2. userId : id of user.
			3. callback function.

## Get chat messages
			```js

			room.getChatMessages(chatId,userId,skip,limit,callback);

			```
			* Method has three parameters.

			1. chatId : chat id (mongo id).
			2. userId : id of user.
			3. skip: skip.
			4. limit : limit.
			5. callback function.

## Update chat
			```js

			room.updateChat(chatId,userId,title,icon,callback);

			```
			* Method has five parameters.

			1. chatId : chat id (mongo id).
			2. userId : id of user exist in group.
			3. title : title to be update //required
			4. icon : url of group icon image.
			5. callback function.

## leave chat
			```js

			room.leaveChat(chatId, userId, callback);

			```
			* Method has three parameters.

			1. chatId : chat id (mongo id).
			2. userId : id of user who wants to leave chat.			
			5. callback function.

## get chats
			```js

			room.getChats(userId, callback);

			```
			* Method has two parameters.

			2. userId : id of user who wants to get chats.			
			5. callback function.
