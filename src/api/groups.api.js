import client from "./client.js";

// GET /Groups
export const getAllGroups = async () => (await client.get("/Groups")).data;

// GET /Groups/:groupId
export const getGroupById = async (groupId) =>
  (await client.get(`/Groups/${groupId}`)).data;

// POST /Groups  — body: { groupName, adminID }
export const createGroup = (groupData) => client.post("/Groups", groupData);

// PUT /Groups/:groupId
export const updateGroup = (groupId, groupData) =>
  client.put(`/Groups/${groupId}`, groupData);

// DELETE /Groups/:groupId
export const deleteGroup = (groupId) => client.delete(`/Groups/${groupId}`);

// GET /Groups/:groupId/members
export const getGroupMembers = async (groupId) =>
  (await client.get(`/Groups/${groupId}/members`)).data;

// POST /Groups/:groupId/join/:userId
export const joinGroup = (groupId, userId) =>
  client.post(`/Groups/${groupId}/join/${userId}`);

// DELETE /Groups/:groupId/leave/:userId
export const leaveGroup = (groupId, userId) =>
  client.delete(`/Groups/${groupId}/leave/${userId}`);

// POST /Groups/:groupId/members/add/:userId
export const addGroupMember = (groupId, userId) =>
  client.post(`/Groups/${groupId}/members/add/${userId}`);

// DELETE /Groups/:groupId/members/remove/:userId
export const removeGroupMember = (groupId, userId) =>
  client.delete(`/Groups/${groupId}/members/remove/${userId}`);

// GET /Groups/:groupId/messages
export const getGroupMessages = async (groupId) =>
  (await client.get(`/Groups/${groupId}/messages`)).data;

// POST /Groups/:groupId/messages/send/:userId  — body: { message_text }
export const sendGroupMessage = (groupId, userId, messageData) =>
  client.post(`/Groups/${groupId}/messages/send/${userId}`, messageData);

// GET /Users/:userId/friends/groups
export const getFriendsGroups = async (userId) =>
  (await client.get(`/Users/${userId}/friends/groups`)).data;

// GET /Groups/:groupId/friends?userId=  (falls back to all members if userId omitted)
export const getFriendsInGroup = async (groupId, userId) =>
  (await client.get(`/Groups/${groupId}/friends`, { params: { userId } })).data;

// GET /Groups/messages/all
export const getAllGroupMessages = async () =>
  (await client.get("/Groups/messages/all")).data;
