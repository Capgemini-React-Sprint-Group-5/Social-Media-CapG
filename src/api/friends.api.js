import client from "./client.js";

/**
 * api/friends.api.js  — Owner: C
 */

/* GET /api/users/:userId/friends */
export const getFriends = async (userId) => {
  const [friendsData, usersData] = await Promise.all([
    client.get("/Friends"),
    client.get("/Users")
  ]);

  const userIdNum = Number(userId);

  const userFriendships = friendsData.filter(f => 
    f.status === "accepted" && 
    (Number(f.userID1) === userIdNum || Number(f.userID2) === userIdNum)
  );

  return userFriendships.map(f => {
    const otherUserId = Number(f.userID1) === userIdNum ? Number(f.userID2) : Number(f.userID1);
    const otherUser = usersData.find(u => Number(u.userID) === otherUserId);
    return {
      friendshipId: f.friendshipID,
      friendId: otherUserId,
      userId: otherUserId,
      username: otherUser?.username || "Unknown",
      email: otherUser?.email || "",
      profile_picture: otherUser?.profile_picture || ""
    };
  });
};

/* POST /Friends */
export const addFriend = async (userId, friendId) => {
  const friendships = await client.get("/Friends");
  const existing = friendships.find(f => 
    (Number(f.userID1) === Number(userId) && Number(f.userID2) === Number(friendId)) ||
    (Number(f.userID1) === Number(friendId) && Number(f.userID2) === Number(userId))
  );

  if (existing) {
    return client.put(`/Friends/${existing.friendshipID}`, {
      ...existing,
      status: "accepted"
    });
  } else {
    return client.post("/Friends", {
      friendshipID: Date.now(),
      userID1: Number(userId),
      userID2: Number(friendId),
      status: "accepted"
    });
  }
};

/* DELETE /Friends/:friendshipID */
export const removeFriend = async (userId, friendId) => {
  const friendships = await client.get("/Friends");
  const existing = friendships.find(f => 
    (Number(f.userID1) === Number(userId) && Number(f.userID2) === Number(friendId)) ||
    (Number(f.userID1) === Number(friendId) && Number(f.userID2) === Number(userId))
  );
  if (existing) {
    return client.delete(`/Friends/${existing.friendshipID}`);
  }
};

/* POST /Friends (pending) */
export const sendFriendRequest = (userId, friendId) =>
  client.post("/Friends", {
    friendshipID: Date.now(),
    userID1: Number(userId),
    userID2: Number(friendId),
    status: "pending"
  });

/* GET pending requests */
export const getPendingRequests = async (userId) => {
  const [friendsData, usersData] = await Promise.all([
    client.get("/Friends"),
    client.get("/Users")
  ]);

  const userIdNum = Number(userId);

  const pendingFriendships = friendsData.filter(f => 
    f.status === "pending" && 
    Number(f.userID2) === userIdNum
  );

  return pendingFriendships.map(f => {
    const senderId = Number(f.userID1);
    const sender = usersData.find(u => Number(u.userID) === senderId);
    return {
      friendshipId: f.friendshipID,
      friendId: senderId,
      userId: senderId,
      username: sender?.username || "Unknown",
      email: sender?.email || "",
      profile_picture: sender?.profile_picture || ""
    };
  });
};
