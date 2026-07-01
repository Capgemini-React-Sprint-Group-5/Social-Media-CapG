import client from './client.js'

/**
 * api/users.api.js  — Owner: A
 * Raw API calls for the /api/users resource.
 * These are plain async functions — no React, no hooks.
 * TanStack Query hooks wrap these in src/hooks/useUsers.js
 */

/** GET /api/users/all */
export const getAllUsers = () =>
  client.get('/api/users/all')

/** GET /api/users/:userId */
export const getUserById = (userId) =>
  client.get(`/api/users/${userId}`)

/** GET /api/users/search/:username */
export const searchUsers = (username) =>
  client.get(`/api/users/search/${username}`)

/** POST /api/users  — body: { username, email, password, ... } */
export const createUser = (userData) =>
  client.post('/api/users', userData)

/** PUT /api/users/update/:userId  — body: partial user fields */
export const updateUser = (userId, userData) =>
  client.put(`/api/users/update/${userId}`, userData)

/** DELETE /api/users/delete/:userId */
export const deleteUser = (userId) =>
  client.delete(`/api/users/delete/${userId}`)

// ── User sub-resources (convenience — used by Profile page) ───────────────

/** GET /api/users/:userId/posts */
export const getUserPosts = (userId) =>
  client.get(`/api/users/${userId}/posts`)

/** GET /api/users/:userId/posts/comments */
export const getUserPostComments = (userId) =>
  client.get(`/api/users/${userId}/posts/comments`)

/** GET /api/users/:userId/posts/likes  — likes received on user's posts */
export const getUserPostLikes = (userId) =>
  client.get(`/api/users/${userId}/posts/likes`)

/** GET /api/users/:userId/likes  — likes given by user */
export const getUserGivenLikes = (userId) =>
  client.get(`/api/users/${userId}/likes`)

/** GET /api/users/:userId/notifications */
export const getUserNotifications = (userId) =>
  client.get(`/api/users/${userId}/notifications`)

/** GET /api/users/:userId/groups */
export const getUserGroups = (userId) =>
  client.get(`/api/users/${userId}/groups`)
