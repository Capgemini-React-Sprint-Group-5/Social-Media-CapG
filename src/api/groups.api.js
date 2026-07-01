import client from './client.js'

/**
 * api/groups.api.js  — Owner: E
 */

// ── Group CRUD ─────────────────────────────────────────────────────────────

// ── Group CRUD ─────────────────────────────────────────────────────────────

/** GET /Groups */
export const getAllGroups = () =>
  client.get('/Groups')

/** GET /Groups/:groupId */
export const getGroupById = (groupId) =>
  client.get(`/Groups/${groupId}`)

/** POST /Groups  — body: { groupName, adminID } */
export const createGroup = (groupData) =>
  client.post('/Groups', {
    ...groupData,
    groupID: Date.now(),
    members: [Number(groupData.adminID)]
  })

/** PUT /Groups/:groupId  — body: { groupName } */
export const updateGroup = (groupId, groupData) =>
  client.put(`/Groups/${groupId}`, groupData)

/** DELETE /Groups/:groupId */
export const deleteGroup = (groupId) =>
  client.delete(`/Groups/${groupId}`)

// ── Membership ─────────────────────────────────────────────────────────────

/** Join a group */
export const joinGroup = async (groupId, userId) => {
  const group = await client.get(`/Groups/${groupId}`);
  const members = group.members || [Number(group.adminID)];
  const userIdNum = Number(userId);
  if (!members.includes(userIdNum)) {
    members.push(userIdNum);
  }
  return client.put(`/Groups/${groupId}`, {
    ...group,
    members
  });
};

/** Leave a group */
export const leaveGroup = async (groupId, userId) => {
  const group = await client.get(`/Groups/${groupId}`);
  const members = group.members || [Number(group.adminID)];
  const updatedMembers = members.filter(id => Number(id) !== Number(userId));
  return client.put(`/Groups/${groupId}`, {
    ...group,
    members: updatedMembers
  });
};

/** Get members of a group */
export const getGroupMembers = async (groupId) => {
  const [group, users] = await Promise.all([
    client.get(`/Groups/${groupId}`),
    client.get('/Users')
  ]);
  const memberIds = group.members || [Number(group.adminID)];
  return users.filter(u => memberIds.includes(Number(u.userID)));
};

/** Add a member to a group */
export const addGroupMember = joinGroup;

/** Remove a member from a group */
export const removeGroupMember = leaveGroup;

// ── Group messaging ────────────────────────────────────────────────────────

/** GET group messages */
export const getGroupMessages = (groupId) =>
  client.get('/Messages', {
    params: {
      groupID: Number(groupId)
    }
  });

/** POST group message */
export const sendGroupMessage = (groupId, userId, messageData) =>
  client.post('/Messages', {
    messageID: Date.now(),
    senderID: Number(userId),
    groupID: Number(groupId),
    message_text: messageData.message_text,
    timestamp: new Date().toISOString()
  });

// ── Group-friend relations ─────────────────────────────────────────────────

/** GET friends groups */
export const getFriendsGroups = async (userId) => {
  return client.get('/Groups');
};

/** GET friends in a group */
export const getFriendsInGroup = (groupId) =>
  getGroupMembers(groupId);
