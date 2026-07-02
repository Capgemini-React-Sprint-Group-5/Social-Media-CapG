import client from "./client.js";

// GET /Users/all
export const getAllUsers = async () => (await client.get("/Users/all")).data;

// GET /Users/:userId
export const getUserById = async (userId) =>
  (await client.get(`/Users/${userId}`)).data;

// GET /Users/search/:username
export const searchUsers = async (username) =>
  (await client.get(`/Users/search/${username}`)).data;

// POST /Users/login
export const loginUser = async (credentials) =>
  (await client.post("/Users/login", credentials)).data;

// POST /Users
export const createUser = (userData) => client.post("/Users", userData);

// PUT /Users/update/:userId
export const updateUser = (userId, userData) =>
  client.put(`/Users/update/${userId}`, userData);

// DELETE /Users/delete/:userId
export const deleteUser = (userId) => client.delete(`/Users/delete/${userId}`);

// GET /Users/:userId/posts
export const getUserPosts = async (userId) =>
  (await client.get(`/Users/${userId}/posts`)).data;

// GET /Users/:userId/posts/comments
export const getUserPostComments = async (userId) =>
  (await client.get(`/Users/${userId}/posts/comments`)).data;

// GET /Users/:userId/posts/likes
export const getUserPostLikes = async (userId) =>
  (await client.get(`/Users/${userId}/posts/likes`)).data;

// GET /Users/:userId/likes
export const getUserGivenLikes = async (userId) =>
  (await client.get(`/Users/${userId}/likes`)).data;

// GET /Users/:userId/notifications
export const getUserNotifications = async (userId) =>
  (await client.get(`/Users/${userId}/notifications`)).data;

// GET /Users/:userId/groups
export const getUserGroups = async (userId) =>
  (await client.get(`/Users/${userId}/groups`)).data;