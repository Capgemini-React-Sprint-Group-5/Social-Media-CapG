import client from './client.js'

/**
 * api/groups.api.js  — Owner: E
 */

// ── Group CRUD ─────────────────────────────────────────────────────────────

/** GET /api/groups */
export const getAllGroups = () =>
  client.get('/api/groups')

/** GET /api/groups/:groupId */
export const getGroupById = (groupId) =>
  client.get(`/api/groups/${groupId}`)

/** POST /api/groups  — body: { groupName, adminID } */
export const createGroup = (groupData) =>
  client.post('/api/groups', groupData)

/** PUT /api/groups/:groupId  — body: { groupName } */
export const updateGroup = (groupId, groupData) =>
  client.put(`/api/groups/${groupId}`, groupData)

/** DELETE /api/groups/:groupId */
export const deleteGroup = (groupId) =>
  client.delete(`/api/groups/${groupId}`)

// ── Membership ─────────────────────────────────────────────────────────────

/** POST /api/groups/:groupId/join/:userId */
export const joinGroup = (groupId, userId) =>
  client.post(`/api/groups/${groupId}/join/${userId}`)

/** DELETE /api/groups/:groupId/leave/:userId */
export const leaveGroup = (groupId, userId) =>
  client.delete(`/api/groups/${groupId}/leave/${userId}`)

/** GET /api/groups/:groupId/members */
export const getGroupMembers = (groupId) =>
  client.get(`/api/groups/${groupId}/members`)

/** POST /api/groups/:groupId/members/add/:userId */
export const addGroupMember = (groupId, userId) =>
  client.post(`/api/groups/${groupId}/members/add/${userId}`)

/** DELETE /api/groups/:groupId/members/remove/:userId */
export const removeGroupMember = (groupId, userId) =>
  client.delete(`/api/groups/${groupId}/members/remove/${userId}`)

// ── Group messaging ────────────────────────────────────────────────────────

/** GET /api/groups/:groupId/messages */
export const getGroupMessages = (groupId) =>
  client.get(`/api/groups/${groupId}/messages`)

/** POST /api/groups/:groupId/messages/send/:userId  — body: { message_text } */
export const sendGroupMessage = (groupId, userId, messageData) =>
  client.post(`/api/groups/${groupId}/messages/send/${userId}`, messageData)

// ── Group-friend relations ─────────────────────────────────────────────────

/** GET /api/users/:userId/friends/groups */
export const getFriendsGroups = (userId) =>
  client.get(`/api/users/${userId}/friends/groups`)

/** GET /api/groups/:groupId/friends */
export const getFriendsInGroup = (groupId) =>
  client.get(`/api/groups/${groupId}/friends`)
