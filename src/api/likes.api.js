import client from './client.js'

/**
 * api/likes.api.js  — Owner: B
 */

/** GET /Likes */
export const getLikesByPost = (postId) =>
  client.get('/Likes', {
    params: {
      postID: Number(postId),
    },
  });

/** POST /Likes */
export const addLike = (postId, userId) => {
  const likeID = Date.now();
  return client.post('/Likes', {
    id: likeID,
    likeID: likeID,
    postID: Number(postId),
    userID: Number(userId),
    timestamp: new Date().toISOString(),
  });
};

/** DELETE /Likes/:likeId */
export const removeLike = (likeId) =>
  client.delete(`/Likes/${likeId}`);
