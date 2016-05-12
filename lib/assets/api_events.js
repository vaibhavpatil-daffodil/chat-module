/**
 * API events definitions
 * @type {Object}
 */
module.exports = {

  chat_user_online: {
    event_code: 'CHAT_USER_ONLINE',
    description: 'A user has come online on chat',
    delivery: ['socket'],
    payload: 1
  },

  chat_user_offline: {
    event_code: 'CHAT_USER_OFFLINE',
    description: 'A user has gone offline on chat',
    delivery: ['socket'],
    payload: {}
  },

  chat_new: {
    event_code: 'CHAT_NEW',
    description: 'A new chat has been initiated',
    delivery: ['socket'],
    payload: {
      chat: {
        adminId: "id of admin user",
        isGroup: "Is it a group chat or not",
        createdOn: "chat was created on",
        title: "Title of the chat (if blank show participants name concatenated)",
        id: "Chat id"
      },
      participants: [
      'id of participants'
      ]
    }
  },

  chat_new_message: {
    event_code: 'CHAT_NEW_MESSAGE',
    description: 'A new chat message has been sent',
    grp_event_code: 'CHAT_GRP_MESSAGE',
    delivery: ['socket'],
    payload: {
      chat: {
        adminId: "id of admin user",
        isGroup: "Is it a group chat or not",
        timestamp: "last time chat was accessed",
        createdOn: "chat was created on",
        title: "Title of the chat (if blank show participants name concatenated)",
        id: "Chat id"
      },
      message: {
            text: "Text of the message",
            timestamp: "message recieved time",
            id: "Message id"
        },
    }
  },

  chat_new_participants: {
    event_code: 'CHAT_NEW_PARTICIPANTS',
    description: 'New participants have been added to chat',
    delivery: ['socket'],
    payload: {
      chat: {
        adminId: "id of admin user",
        isGroup: "Is it a group chat or not",
        timestamp: "last time chat was accessed",
        createdOn: "chat was created on",
        title: "Title of the chat (if blank show participants name concatenated)",
        id: "Chat id"
      },
      participants: [
        {
            id: "User id"
        }
      ]
    }
  },

  chat_removed_participants: {
    event_code: 'CHAT_REMOVED_PARTICIPANTS',
    description: 'Some participants have been removed from chat',
    delivery: ['socket'],
    payload: {
      chat: {
        adminId: "id of admin user",
        isGroup: "Is it a group chat or not",
        timestamp: "last time chat was accessed",
        createdOn: "chat was created on",
        title: "Title of the chat (if blank show participants name concatenated)",
        id: "Chat id"
      },
      participants: [
        {
            id: "User id"
        }
      ]
    }
  },

  chat_removed_from: {
    event_code: 'CHAT_REMOVED_FROM',
    description: 'You have been removed from chat by its admin',
    delivery: ['socket'],
    payload: {
      chat: {
        adminId: "id of admin user",
        isGroup: "Is it a group chat or not",
        timestamp: "last time chat was accessed",
        createdOn: "chat was created on",
        title: "Title of the chat (if blank show participants name concatenated)",
        id: "Chat id"
      }
    }
  },

  chat_left: {
    event_code: 'CHAT_LEFT',
    description: 'One of the user left',
    delivery: ['socket'],
    payload: {
      chat: {
        adminId: "id of admin user",
        isGroup: "Is it a group chat or not",
        timestamp: "last time chat was accessed",
        createdOn: "chat was created on",
        title: "Title of the chat (if blank show participants name concatenated)",
        id: "Chat id"
      },
      participants: [
        {
            id: "User id"
        }
      ],
      user_left: {
          id: "User id"
      }
    }
  }
};
