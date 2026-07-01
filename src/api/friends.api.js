import client from "./client.js";

/**
 * api/friends.api.js  — Owner: C
 */

/* GET /api/users/:userId/friends */
export const getFriends = (userId) =>
  client.get(`/api/users/${userId}/friends`);

/* POST /api/users/:userId/friends/:friendId */
export const addFriend = (userId, friendId) =>
  client.post(`/api/users/${userId}/friends/${friendId}`);

/* DELETE /api/users/:userId/friends/:friendId */
export const removeFriend = (userId, friendId) =>
  client.delete(`/api/users/${userId}/friends/${friendId}`);

/* POST /api/users/:userId/friend-requests/send/:friendId */
export const sendFriendRequest = (userId, friendId) =>
  client.post(`/api/users/${userId}/friend-requests/send/${friendId}`);

/* GET /api/users/:userId/friend-requests/pending */
export const getPendingRequests = (userId) =>
  client.get(`/api/users/${userId}/friend-requests/pending`);
