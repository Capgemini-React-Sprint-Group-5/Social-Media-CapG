import client from "./client.js";
import { getAllUsers } from "./users.api.js";

// GET /Users/:userId/friends (accepted only, enriched with user info)
export const getFriends = async (userId) => {
  const [friendsData, usersData] = await Promise.all([
    client.get(`/Users/${userId}/friends`),
    getAllUsers(),
  ]);

  // Handle nested object response setups safely
  const friends = friendsData?.data || friendsData || [];
  const users = usersData?.data || usersData || [];

  return friends
    .filter((f) => f.status === "accepted")
    .map((f) => {
      // Look for the user matching either friendId or direct user links
      const targetId = f.friendId || f.userID2 || f.userID1;
      const u = users.find((u) => String(u.userID || u.id || u.userId) === String(targetId));
      
      return {
        friendshipId: f.friendshipID || f.id,
        friendId: targetId,
        username: u?.username || f.username || `User #${targetId}`,
        email: u?.email || "",
        profile_picture: u?.profile_picture || "",
      };
    });
};
// GET /Users/:userId/friend-requests/pending (requests received)
export const getPendingRequests = async (userId) => {
  const [pending, users] = await Promise.all([
    (await client.get(`/Users/${userId}/friend-requests/pending`)).data,
    getAllUsers(),
  ]);

  return pending
    .filter((f) => String(f.userID2) === String(userId))
    .map((f) => {
      const u = users.find((u) => String(u.userID) === String(f.userID1));
      return {
        friendshipId: f.friendshipID,
        friendId: f.userID1,
        username: u?.username,
        email: u?.email,
        profile_picture: u?.profile_picture,
      };
    });
};

// POST /Users/:userId/friend-requests/send/:friendId
export const sendFriendRequest = (userId, friendId) =>
  client.post(`/Users/${userId}/friend-requests/send/${friendId}`);

// POST /Users/:userId/friends/:friendId
export const addFriend = (userId, friendId) =>
  client.post(`/Users/${userId}/friends/${friendId}`);

// DELETE /Users/:userId/friends/:friendId
export const removeFriend = (userId, friendId) =>
  client.delete(`/Users/${userId}/friends/${friendId}`);

// GET /Friends/:friendshipId/messages
export const getFriendMessages = async (friendshipId) =>
  (await client.get(`/Friends/${friendshipId}/messages`)).data;

// POST /Friends/:friendshipId/messages/send
export const sendFriendMessage = (friendshipId, messageData) =>
  client.post(`/Friends/${friendshipId}/messages/send`, messageData);

export const getSentRequests = async (userId) =>
  (await client.get(`/Users/${userId}/friend-requests/sent`)).data;

export const cancelFriendRequest = (userId, friendId) =>
  client.delete(
    `/Users/${userId}/friend-requests/cancel/${friendId}`
  );