import client from "./client";

/* ===========================
   Users
=========================== */

/** GET /Users */
export const getAllUsers = () =>
  client.get("/Users");

/** GET /Users/:id */
export const getUserById = (userId) =>
  client.get(`/Users/${userId}`);

/** Search by username */
export const searchUsers = (username) =>
  client.get("/Users", {
    params: {
      username,
    },
  });

/** Create User */
export const createUser = (userData) =>
  client.post("/Users", userData);

/** Update User */
export const updateUser = (userId, userData) =>
  client.put(`/Users/${userId}`, userData);

/** Delete User */
export const deleteUser = (userId) =>
  client.delete(`/Users/${userId}`);

/* ===========================
   User Posts
=========================== */

export const getUserPosts = (userId) =>
  client.get("/Posts", {
    params: {
      userID: Number(userId),
    },
  });

/* ===========================
   Comments on User's Posts
=========================== */

export const getUserPostComments = async (userId) => {
  const posts = await client.get("/Posts", {
    params: {
      userID: Number(userId),
    },
  });

  if (!posts || !posts.length) return [];

  const comments = await Promise.all(
    posts.map((post) =>
      client.get("/Comments", {
        params: {
          postID: post.postID,
        },
      })
    )
  );

  return comments.flat();
};

/* ===========================
   Likes received on User's Posts
=========================== */

export const getUserPostLikes = async (userId) => {
  const posts = await client.get("/Posts", {
    params: {
      userID: Number(userId),
    },
  });

  if (!posts || !posts.length) return [];

  const likes = await Promise.all(
    posts.map((post) =>
      client.get("/Likes", {
        params: {
          postID: post.postID,
        },
      })
    )
  );

  return likes.flat();
};

/* ===========================
   Likes Given By User
=========================== */

export const getUserGivenLikes = (userId) =>
  client.get("/Likes", {
    params: {
      userID: Number(userId),
    },
  });

/* ===========================
   Notifications
=========================== */

export const getUserNotifications = (userId) =>
  client.get("/Notifications", {
    params: {
      userID: Number(userId),
    },
  });

/* ===========================
   Groups
=========================== */

export const getUserGroups = (userId) =>
  client.get("/Groups", {
    params: {
      userID: Number(userId),
    },
  });