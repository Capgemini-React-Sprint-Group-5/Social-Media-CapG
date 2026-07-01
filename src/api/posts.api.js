import client from "./client.js";
import { getAllUsers } from "./users.api.js";

// GET /Post/:postId
export const getPostById = async (postId) =>
  (await client.get(`/Post/${postId}`)).data;

// POST /Post
export const createPost = (postData) => client.post("/Post", postData);

// PUT /Post/update/:postId
export const updatePost = (postId, postData) =>
  client.put(`/Post/update/${postId}`, postData);

// DELETE /Post/delete/:postId
export const deletePost = (postId) => client.delete(`/Post/delete/${postId}`);

// GET /Users/:userId/posts (per user)
export const getPostsByUser = async (userId) =>
  (await client.get(`/Users/${userId}/posts`)).data;

// no all-posts endpoint — composed across every user's posts
// export const getAllPosts = async () => {
//   const users = await getAllUsers();
//   const posts = await Promise.all(users.map((u) => getPostsByUser(u.userID)));
//   return posts.flat();
// };

export const getAllPosts = async (postId) => (await client.get(`/Posts`)).data;

// no search endpoint — filtered client-side over getAllPosts
export const searchPosts = async (text) => {
  const posts = await getAllPosts();
  return posts.filter((p) =>
    p.content?.toLowerCase().includes(text.toLowerCase()),
  );
};

// GET /Posts/:postId/comments
export const getPostComments = async (postId) =>
  (await client.get(`/Posts/${postId}/comments`)).data;

// GET /Posts/:postId/likes
export const getPostLikes = async (postId) =>
  (await client.get(`/Posts/${postId}/likes`)).data;
