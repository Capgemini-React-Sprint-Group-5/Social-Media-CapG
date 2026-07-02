import client from "./client.js";

// GET /Comments
export const getAllComments = async () => (await client.get("/Comments")).data;

// GET /Comments/:commentId
export const getCommentById = async (commentId) =>
  (await client.get(`/Comments/${commentId}`)).data;

// GET /Posts/:postId/comments
export const getCommentsByPost = async (postId) =>
  (await client.get(`/Posts/${postId}/comments`)).data;

// no by-user endpoint — filtered client-side over getAllComments
export const getCommentsByUser = async (userId) => {
  const comments = await getAllComments();
  return comments.filter((c) => String(c.userID) === String(userId));
};

// POST /Comments  (or POST /Posts/:postId/comments if postId is known up front)
export const createComment = (commentData) =>
  client.post("/Comments", commentData);
export const addCommentToPost = (postId, commentData) =>
  client.post(`/Posts/${postId}/comments`, commentData);

// PUT /Comments/:commentId
export const updateComment = (commentId, commentData) =>
  client.put(`/Comments/${commentId}`, commentData);

// DELETE /Comments/:commentId
export const deleteComment = (commentId) =>
  client.delete(`/Comments/${commentId}`);

// DELETE /Posts/:postId/comments/:commentId
export const deleteCommentFromPost = (postId, commentId) =>
  client.delete(`/Posts/${postId}/comments/${commentId}`);

// GET /Post/:postId  (via comment's postID)
export const getCommentPost = async (commentId) => {
  const comment = await getCommentById(commentId);
  return (await client.get(`/Post/${comment.postID}`)).data;
};

// GET /Users/:userId  (via comment's userID)
export const getCommentUser = async (commentId) => {
  const comment = await getCommentById(commentId);
  return (await client.get(`/Users/${comment.userID}`)).data;
};