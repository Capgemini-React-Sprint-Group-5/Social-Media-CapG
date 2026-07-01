/**
 * queryKeys.js
 * Single source of truth for all TanStack Query cache keys.
 *
 * RULE: Never write a raw array in useQuery/useMutation — always reference this.
 * This makes invalidation predictable and prevents key typos causing stale data.
 *
 * Pattern:
 *   queryKeys.posts.all          → ['posts']          (invalidates everything under posts)
 *   queryKeys.posts.byId(1)      → ['posts', 1]       (single post)
 *   queryKeys.posts.byUser(5)    → ['posts', 'user', 5]
 */

export const queryKeys = {
  // ── Users ─────────────────────────────────────────────────────────────────
  users: {
    all:    ()           => ['users'],
    byId:   (userId)     => ['users', userId],
    search: (username)   => ['users', 'search', username],
  },

  // ── Posts ─────────────────────────────────────────────────────────────────
  posts: {
    all:    ()           => ['posts'],
    byId:   (postId)     => ['posts', postId],
    byUser: (userId)     => ['posts', 'user', userId],
    feed:   (userId)     => ['posts', 'feed', userId],   // aggregated home feed
  },

  // ── Comments ──────────────────────────────────────────────────────────────
  comments: {
    all:     ()          => ['comments'],
    byId:    (commentId) => ['comments', commentId],
    byPost:  (postId)    => ['comments', 'post', postId],
    byUser:  (userId)    => ['comments', 'user', userId],
  },

  // ── Likes ─────────────────────────────────────────────────────────────────
  likes: {
    byPost:          (postId) => ['likes', 'post', postId],
    givenByUser:     (userId) => ['likes', 'given', userId],
    receivedByUser:  (userId) => ['likes', 'received', userId],
  },

  // ── Friends ───────────────────────────────────────────────────────────────
  friends: {
    list:    (userId) => ['friends', userId],
    pending: (userId) => ['friends', 'pending', userId],
  },

  // ── Messages ──────────────────────────────────────────────────────────────
  messages: {
    all:            ()                           => ['messages'],
    conversation:   (userId, otherUserId)        => ['messages', userId, otherUserId],
    friendThread:   (friendshipId)               => ['messages', 'friend', friendshipId],
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  notifications: {
    byUser: (userId) => ['notifications', userId],
  },

  // ── Groups ────────────────────────────────────────────────────────────────
  groups: {
    all:        ()          => ['groups'],
    byId:       (groupId)   => ['groups', groupId],
    members:    (groupId)   => ['groups', groupId, 'members'],
    messages:   (groupId)   => ['groups', groupId, 'messages'],
    byUser:     (userId)    => ['groups', 'user', userId],
    friendsIn:  (groupId)   => ['groups', groupId, 'friends'],
    withFriend: (userId)    => ['groups', 'friends', userId],
  },
}
