import client from "./client.js";

// GET /Messages
export const getAllMessages = async () => (await client.get("/Messages")).data;

// GET /Messages/:messageId
export const getMessageById = async (messageId) =>
  (await client.get(`/Messages/${messageId}`)).data;

// POST /Messages
export const createMessage = (messageData) =>
  client.post("/Messages", messageData);

// PUT /Messages/:messageId
export const updateMessage = (messageId, messageData) =>
  client.put(`/Messages/${messageId}`, messageData);

// DELETE /Messages/:messageId
export const deleteMessage = (messageId) =>
  client.delete(`/Messages/${messageId}`);

// GET /Users/:userId/messages/:otherUserId
export const getConversation = async (userId, otherUserId) =>
  (await client.get(`/Users/${userId}/messages/${otherUserId}`)).data;

// POST /Users/:userId/messages/send/:otherUserId  — body: { message_text }
export const sendMessage = (userId, otherUserId, messageData) =>
  client.post(`/Users/${userId}/messages/send/${otherUserId}`, messageData);
