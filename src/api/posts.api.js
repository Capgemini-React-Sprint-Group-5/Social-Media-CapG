import client from './client.js'

/**
 * api/posts.api.js  — Owner: B
 * Raw API calls for the /api/post resource.
 */

/** GET /api/post/:postId */
export const getPostById = (postId) =>
  client.get(`/api/post/${postId}`)

/** POST /api/post  — body: { userId, content } */
export const createPost = (postData) =>
  client.post('/api/post', postData)

/** PUT /api/post/update/:postId  — body: { content } */
export const updatePost = (postId, postData) =>
  client.put(`/api/post/update/${postId}`, postData)

/** DELETE /api/post/delete/:postId */
export const deletePost = (postId) =>
  client.delete(`/api/post/delete/${postId}`)
