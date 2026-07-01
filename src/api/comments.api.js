import client from './client.js'

/**
 * api/comments.api.js  — Owner: B
 */

/** GET /api/comments */
export const getAllComments = () =>
  client.get('/api/comments')

/** GET /api/comments/:commentId */
export const getCommentById = (commentId) =>
  client.get(`/api/comments/${commentId}`)

/** POST /api/comments  — body: { postId, userId, comment_text } */
export const createComment = (commentData) =>
  client.post('/api/comments', commentData)

/** PUT /api/comments/:commentId  — body: { comment_text } */
export const updateComment = (commentId, commentData) =>
  client.put(`/api/comments/${commentId}`, commentData)

/** DELETE /api/comments/:commentId */
export const deleteComment = (commentId) =>
  client.delete(`/api/comments/${commentId}`)

// ── Post-scoped comment endpoints ─────────────────────────────────────────

/** GET /api/posts/:postId/comments */
export const getCommentsByPost = (postId) =>
  client.get(`/api/posts/${postId}/comments`)

/** POST /api/posts/:postId/comments  — body: { userId, comment_text } */
export const addCommentToPost = (postId, commentData) =>
  client.post(`/api/posts/${postId}/comments`, commentData)

/** DELETE /api/posts/:postId/comments/:commentId */
export const deleteCommentFromPost = (postId, commentId) =>
  client.delete(`/api/posts/${postId}/comments/${commentId}`)
