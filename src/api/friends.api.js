import client from './client.js';

// ── Helper: Find friendship between two users ──────────────────────────────
const findFriendship = async (userId, friendId) => {
  const friendships = await client.get('/Friends');
  const uid = Number(userId);
  const fid = Number(friendId);
  return friendships.find(f =>
    (Number(f.userID1) === uid && Number(f.userID2) === fid) ||
    (Number(f.userID1) === fid && Number(f.userID2) === uid)
  );
};

/* GET /api/users/:userId/friends */
export const getFriends = async (userId) => {
  const [friendsData, usersData] = await Promise.all([
    client.get('/Friends'),
    client.get('/Users')
  ]);

  const userIdNum = Number(userId);

  const userFriendships = friendsData.filter(f =>
    f.status === 'accepted' &&
    (Number(f.userID1) === userIdNum || Number(f.userID2) === userIdNum)
  );

  return userFriendships.map(f => {
    const otherUserId = Number(f.userID1) === userIdNum
      ? Number(f.userID2)
      : Number(f.userID1);
    const otherUser = usersData.find(u => Number(u.userID) === otherUserId);
    return {
      friendshipId: f.friendshipID,   // <-- Using your DB convention
      friendId: otherUserId,
      userId: otherUserId,
      username: otherUser?.username || 'Unknown',
      email: otherUser?.email || '',
      profile_picture: otherUser?.profile_picture || ''
    };
  });
};

/* POST /Friends — add or accept a friend */
export const addFriend = async (userId, friendId) => {
  const existing = await findFriendship(userId, friendId);
  const uid = Number(userId);
  const fid = Number(friendId);

  if (existing) {
    // Update existing record to 'accepted'
    return client.put(`/Friends/${existing.id}`, {  // <-- URL uses 'id', but we keep friendshipID in object
      ...existing,
      status: 'accepted'
    });
  } else {
    // Create new accepted friendship with friendshipID
    return client.post('/Friends', {
      friendshipID: Date.now(),  // <-- Generate a new friendshipID
      userID1: uid,
      userID2: fid,
      status: 'accepted'
    });
  }
};

/* DELETE /Friends/:friendshipID (uses id in URL, but we find by friendshipID) */
export const removeFriend = async (userId, friendId) => {
  const existing = await findFriendship(userId, friendId);
  if (existing) {
    return client.delete(`/Friends/${existing.id}`);  // <-- JSON Server uses 'id' in URL
  }
  throw new Error('Friendship not found');
};

/* POST /Friends (pending request) */
export const sendFriendRequest = async (userId, friendId) => {
  const existing = await findFriendship(userId, friendId);
  const uid = Number(userId);
  const fid = Number(friendId);

  if (existing) {
    // If already exists but was declined, reactivate it
    if (existing.status === 'rejected' || existing.status === 'declined') {
      return client.put(`/Friends/${existing.id}`, {
        ...existing,
        status: 'pending'
      });
    }
    // If already pending or accepted, just return it (prevents duplicates)
    return existing;
  }

  // Create new pending request with friendshipID
  return client.post('/Friends', {
    friendshipID: Date.now(),  // <-- Generate a new friendshipID
    userID1: uid,
    userID2: fid,
    status: 'pending'
  });
};

/* GET pending requests */
export const getPendingRequests = async (userId) => {
  const [friendsData, usersData] = await Promise.all([
    client.get('/Friends'),
    client.get('/Users')
  ]);

  const userIdNum = Number(userId);

  const pendingFriendships = friendsData.filter(f =>
    f.status === 'pending' &&
    Number(f.userID2) === userIdNum
  );

  return pendingFriendships.map(f => {
    const senderId = Number(f.userID1);
    const sender = usersData.find(u => Number(u.userID) === senderId);
    return {
      friendshipId: f.friendshipID,   // <-- Using your DB convention
      friendId: senderId,
      userId: senderId,
      username: sender?.username || 'Unknown',
      email: sender?.email || '',
      profile_picture: sender?.profile_picture || ''
    };
  });
};