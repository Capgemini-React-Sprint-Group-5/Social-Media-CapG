import client from "./client";

/* ===========================
   Comments
=========================== */

/** GET /Comments */
export const getAllComments = () =>
  client.get("/Comments");

/** GET /Comments/:commentID */
export const getCommentById = (commentId) =>
  client.get(`/Comments/${commentId}`);

/** GET comments of a post */
export const getCommentsByPost = (postId) =>
  client.get("/Comments", {
    params: {
      postID: Number(postId),
    },
  });

/** GET comments made by a user */
export const getCommentsByUser = (userId) =>
  client.get("/Comments", {
    params: {
      userID: Number(userId),
    },
  });

/** Create Comment */
export const createComment = (commentData) =>
  client.post("/Comments", commentData);

/** Update Comment */
export const updateComment = (commentId, commentData) =>
  client.put(`/Comments/${commentId}`, commentData);

/** Delete Comment */
export const deleteComment = (commentId) =>
  client.delete(`/Comments/${commentId}`);

/* ===========================
   Relations
=========================== */

/** Fetch post for a comment */
export const getCommentPost = async (commentId) => {
  const comment = await client.get(`/Comments/${commentId}`);

  return client.get(`/Posts/${comment.postID}`);
};

/** Fetch user who wrote the comment */
export const getCommentUser = async (commentId) => {
  const comment = await client.get(`/Comments/${commentId}`);

  return client.get(`/Users/${comment.userID}`);
};