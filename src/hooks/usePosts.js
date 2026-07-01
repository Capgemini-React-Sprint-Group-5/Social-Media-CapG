import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../store/index.js'
import { queryKeys } from '../queryKeys.js'
import * as postsApi from '../api/posts.api.js'
import * as usersApi from '../api/users.api.js'
import * as friendsApi from '../api/friends.api.js'

/**
 * hooks/usePosts.js  — Owner: B
 */

// ── FULLY WORKED EXAMPLE ──────────────────────────────────────────────────

/**
 * Fetch all posts for a given user.
 * Usage: const { data: posts } = useUserPosts(userId)
 */
export function useUserPosts(userId) {
  return useQuery({
    queryKey: queryKeys.posts.byUser(userId),
    queryFn:  () => usersApi.getUserPosts(userId),
    enabled:  !!userId,
  })
}

// ── KEY HOOK — Home Feed (no /api/posts endpoint exists) ──────────────────

/**
 * Home feed: fetch friends list, then fetch each friend's posts in parallel,
 * merge and sort newest-first.
 *
 * This is the one place we do N+1 intentionally — the API gives us no choice.
 * useQueries fires all friend-post requests in parallel so it's one round-trip
 * per friend, not serial.
 *
 * Usage: const { posts, isLoading } = useFriendsFeed()
 */
export function useFriendsFeed() {
  const currentUser = useSelector(selectCurrentUser)
  const userId = currentUser?.userId

  // Step 1 — get the friends list
  const friendsQuery = useQuery({
    queryKey: queryKeys.friends.list(userId),
    queryFn:  () => friendsApi.getFriends(userId),
    enabled:  !!userId,
  })

  const friends = friendsQuery.data || []

  // Step 2 — fire one query per friend in parallel
  const postQueries = useQueries({
    queries: friends.map((friend) => ({
      queryKey: queryKeys.posts.byUser(friend.friendId || friend.userId),
      queryFn:  () => usersApi.getUserPosts(friend.friendId || friend.userId),
      enabled:  !!friend,
    })),
  })

  // Step 3 — merge and sort
  const posts = postQueries
    .flatMap((q) => q.data || [])
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const isLoading = friendsQuery.isLoading || postQueries.some((q) => q.isLoading)
  const isError   = friendsQuery.isError   || postQueries.some((q) => q.isError)

  return { posts, isLoading, isError }
}

// ── STUBS ─────────────────────────────────────────────────────────────────

/**
 * Fetch a single post by ID.
 * Usage: const { data: post } = usePost(postId)
 */
export function usePost(postId) {
  return useQuery({
    queryKey: queryKeys.posts.byId(postId),
    queryFn:  () => postsApi.getPostById(postId),
    enabled:  !!postId,
  })
}

/**
 * Create a post.
 * Usage:
 *   const { mutate: create } = useCreatePost()
 *   create({ userId, content })
 */
export function useCreatePost() {
  const queryClient   = useQueryClient()
  const currentUser   = useSelector(selectCurrentUser)
  return useMutation({
    mutationFn: postsApi.createPost,
    onSuccess: () => {
      // Invalidate the current user's posts and the feed
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.byUser(currentUser?.userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed(currentUser?.userId) })
    },
  })
}

/**
 * Update a post.
 * Usage:
 *   const { mutate: update } = useUpdatePost()
 *   update({ postId, postData: { content } })
 */
export function useUpdatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, postData }) => postsApi.updatePost(postId, postData),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.byId(postId) })
    },
  })
}

/**
 * Delete a post.
 * Usage:
 *   const { mutate: remove } = useDeletePost()
 *   remove({ postId, userId })  — userId needed to invalidate user's post list
 */
export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId }) => postsApi.deletePost(postId),
    onSuccess: (_, { postId, userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.byId(postId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.byUser(userId) })
    },
  })
}
