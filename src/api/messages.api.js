import client from './client.js'

/**
 * api/messages.api.js  — Owner: D
 */

// ── Generic message CRUD ───────────────────────────────────────────────────

/** GET /api/messages */
export const getAllMessages = () =>
  client.get('/api/messages')

/** GET /api/messages/:messageId */
export const getMessageById = (messageId) =>
  client.get(`/api/messages/${messageId}`)

/** POST /api/messages  — body: { senderID, receiverID, message_text } */
export const createMessage = (messageData) =>
  client.post('/api/messages', messageData)

/** PUT /api/messages/:messageId  — body: { message_text } */
export const updateMessage = (messageId, messageData) =>
  client.put(`/api/messages/${messageId}`, messageData)

/** DELETE /api/messages/:messageId */
export const deleteMessage = (messageId) =>
  client.delete(`/api/messages/${messageId}`)

// ── User DM conversation ───────────────────────────────────────────────────

/** GET /api/users/:userId/messages/:otherUserId */
export const getConversation = (userId, otherUserId) =>
  client.get(`/api/users/${userId}/messages/${otherUserId}`)

/** POST /api/users/:userId/messages/send/:otherUserId  — body: { message_text } */
export const sendMessage = (userId, otherUserId, messageData) =>
  client.post(`/api/users/${userId}/messages/send/${otherUserId}`, messageData)

// ── Friend conversation ────────────────────────────────────────────────────

/** GET /api/friends/:friendshipId/messages */
export const getFriendMessages = (friendshipId) =>
  client.get(`/api/friends/${friendshipId}/messages`)

/** POST /api/friends/:friendshipId/messages/send  — body: { senderID, message_text } */
export const sendFriendMessage = (friendshipId, messageData) =>
  client.post(`/api/friends/${friendshipId}/messages/send`, messageData)
