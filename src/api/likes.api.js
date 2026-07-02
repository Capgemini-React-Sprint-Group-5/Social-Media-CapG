import client from "./client.js";

// GET /Posts/:postId/likes
export const getLikesByPost = async (postId) =>
  (await client.get(`/Posts/${postId}/likes`)).data;

// POST /Posts/:postId/likes/add/:userId
export const addLike = (postId, userId) =>
  client.post(`/Posts/${postId}/likes/add/${userId}`);

// DELETE /Posts/:postId/likes/remove/:likeId
export const removeLike = (postId, likeId) =>
  client.delete(`/Posts/${postId}/likes/remove/${likeId}`);
