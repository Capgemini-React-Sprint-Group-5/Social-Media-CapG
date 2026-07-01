import client from "./client";

/* ===========================
   Posts
=========================== */

/** GET /Posts */
export const getAllPosts = () =>
  client.get("/Posts");

/** GET /Posts/:postID */
export const getPostById = (postId) =>
  client.get(`/Posts/${postId}`);

/** GET /Posts?userID= */
export const getPostsByUser = (userId) =>
  client.get("/Posts", {
    params: {
      userID: Number(userId),
    },
  });

/** Create Post */
export const createPost = (postData) =>
  client.post("/Posts", postData);

/** Update Post */
export const updatePost = (postId, postData) =>
  client.put(`/Posts/${postId}`, postData);

/** Delete Post */
export const deletePost = (postId) =>
  client.delete(`/Posts/${postId}`);

/* ===========================
   Post Relations
=========================== */

/** Comments of a Post */
export const getPostComments = (postId) =>
  client.get("/Comments", {
    params: {
      postID: Number(postId),
    },
  });

/** Likes of a Post */
export const getPostLikes = (postId) =>
  client.get("/Likes", {
    params: {
      postID: Number(postId),
    },
  });

/** Search posts by content */
export const searchPosts = (text) =>
  client.get("/Posts", {
    params: {
      q: text,
    },
  });