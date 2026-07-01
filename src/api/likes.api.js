import client from './client.js'

/**
 * api/likes.api.js  — Owner: B
 */

/** GET /api/posts/:postId/likes */
export const getLikesByPost = (postId) =>
  client.get(`/api/posts/${postId}/likes`)

/** POST /api/posts/:postId/likes/add/:userId */
export const addLike = (postId, userId) =>
  client.post(`/api/posts/${postId}/likes/add/${userId}`)

/** DELETE /api/posts/:postId/likes/remove/:likeId */
export const removeLike = (postId, likeId) =>
  client.delete(`/api/posts/${postId}/likes/remove/${likeId}`)
