import client from './client.js'

/**
 * api/messages.api.js  — Owner: D
 */

// ── Generic message CRUD ───────────────────────────────────────────────────

/** GET /Messages */
export const getAllMessages = () =>
  client.get('/Messages')

/** GET /Messages/:messageId */
export const getMessageById = (messageId) =>
  client.get(`/Messages/${messageId}`)

/** POST /Messages  — body: { senderID, receiverID, message_text } */
export const createMessage = (messageData) =>
  client.post('/Messages', messageData)

/** PUT /Messages/:messageId  — body: { message_text } */
export const updateMessage = (messageId, messageData) =>
  client.put(`/Messages/${messageId}`, messageData)

/** DELETE /Messages/:messageId */
export const deleteMessage = (messageId) =>
  client.delete(`/Messages/${messageId}`)

// ── User DM conversation ───────────────────────────────────────────────────

/** GET DMs between two users */
export const getConversation = async (userId, otherUserId) => {
  const messages = await client.get('/Messages');
  const uid = Number(userId);
  const ouid = Number(otherUserId);
  return messages.filter(m => 
    (Number(m.senderID) === uid && Number(m.receiverID) === ouid) ||
    (Number(m.senderID) === ouid && Number(m.receiverID) === uid)
  );
};

/** POST DM between two users */
export const sendMessage = (userId, otherUserId, messageData) =>
  client.post('/Messages', {
    messageID: Date.now(),
    senderID: Number(userId),
    receiverID: Number(otherUserId),
    message_text: messageData.message_text,
    timestamp: new Date().toISOString()
  });

// ── Friend conversation ────────────────────────────────────────────────────

/** GET messages for a friendship thread */
export const getFriendMessages = async (friendshipId) => {
  const messages = await client.get('/Messages');
  return messages.filter(m => Number(m.friendshipID) === Number(friendshipId));
};

/** POST message to friendship thread */
export const sendFriendMessage = (friendshipId, messageData) =>
  client.post('/Messages', {
    messageID: Date.now(),
    friendshipID: Number(friendshipId),
    senderID: Number(messageData.senderID),
    message_text: messageData.message_text,
    timestamp: new Date().toISOString()
  });
