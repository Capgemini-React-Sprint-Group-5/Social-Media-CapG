// hooks/usePosts.js
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../store/index.js'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' }
})

// Helper function to dynamically pull profile photos and names for feed consistency
async function hydratePostWithUser(postItem) {
  if (!postItem) return null
  const targetUserId = postItem.userID || postItem.userId
  try {
    const userResponse = await api.get(`/Users/${targetUserId}`)
    return {
      ...postItem,
      user: userResponse.data?.data || userResponse.data
    }
  } catch (err) {
    return {
      ...postItem,
      user: { username: `User #${targetUserId}`, profile_picture: "profile1.jpg" }
    }
  }
}

// Hook 1: Fetching posts created by a specific user profile (e.g., Profile Page)
export function useUserPosts(profileUserId) {
  return useQuery({
    queryKey: ['posts', 'user', String(profileUserId)],
    queryFn: async () => {
      const response = await api.get(`/Users/${profileUserId}/posts`)
      const rawPosts = response.data?.data || response.data || []
      return await Promise.all(rawPosts.map(hydratePostWithUser))
    },
    enabled: !!profileUserId,
  })
}

// Hook 2: Aggregating the master social feed timeline (Current User + Friends)
export function useFriendsFeed() {
  const currentUser = useSelector(selectCurrentUser)
  const userId = currentUser?.userID || currentUser?.userId || currentUser?.id
  const queryClient = useQueryClient()

  // 1. Fetch the user's friend list
  const friendsQuery = useQuery({
    queryKey: ['friends', 'list', String(userId)],
    queryFn: async () => {
      const response = await api.get(`/Users/${userId}/friends`)
      return response.data?.data || []
    },
    enabled: !!userId,
  })

  // Normalize mapping to handle variations across data states (accepted vs friend)
  const acceptedFriends = (friendsQuery.data || []).filter(
    (f) => f.status === 'accepted' || f.status === 'friend'
  )

  // 2. Fetch the current authenticated user's own posts
  const currentUserPostsQuery = useQuery({
    queryKey: ['posts', 'user', String(userId)],
    queryFn: async () => {
      const response = await api.get(`/Users/${userId}/posts`)
      const rawPosts = response.data?.data || []
      return await Promise.all(rawPosts.map(hydratePostWithUser))
    },
    enabled: !!userId,
  })

  // 3. Dynamic Parallel Queries: Keep background synchronization alive
  const postQueries = useQueries({
    queries: acceptedFriends.map((friend) => {
      const targetFriendId = friend.friendId || friend.userID2 || friend.userID1
      return {
        queryKey: ['posts', 'user', String(targetFriendId)],
        queryFn: async () => {
          const response = await api.get(`/Users/${targetFriendId}/posts`)
          const rawPosts = response.data?.data || []
          return await Promise.all(rawPosts.map(hydratePostWithUser))
        },
        enabled: !!targetFriendId,
      }
    }),
  })

  // Pull directly from the persistent global cache layer by unified key string templates
  const myPosts = currentUserPostsQuery.data || queryClient.getQueryData(['posts', 'user', String(userId)]) || []
  
  const friendsPosts = acceptedFriends.flatMap((friend) => {
    const targetFriendId = friend.friendId || friend.userID2 || friend.userID1
    return queryClient.getQueryData(['posts', 'user', String(targetFriendId)]) || []
  })

  // Combine and sort timelines chronologically
  const posts = [...myPosts, ...friendsPosts]
    .filter(Boolean)
    .sort((a, b) => {
      const timeA = a.timestamp === 'NOW()' ? Date.now() : new Date(a.timestamp).getTime()
      const timeB = b.timestamp === 'NOW()' ? Date.now() : new Date(b.timestamp).getTime()
      return timeB - timeA
    })

  const isLoading = friendsQuery.isLoading || currentUserPostsQuery.isLoading
  const isError = friendsQuery.isError || currentUserPostsQuery.isError

  return { posts, isLoading, isError }
}

// Hook 3: Submitting new entries to the user's stream
export function useCreatePost() {
  const queryClient = useQueryClient()
  const currentUser = useSelector(selectCurrentUser)
  const userId = currentUser?.userID || currentUser?.userId || currentUser?.id

  return useMutation({
    mutationFn: async ({ content }) => {
      const response = await api.post('/Post', {
        userID: String(userId),
        content: content,
        timestamp: new Date().toISOString()
      })
      return response.data
    },
    onSuccess: () => {
      // Clear all post lists globally to force an instant timeline refresh
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

// Hook 4: Updating a post
export function useUpdatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ postId, content }) => {
      const response = await api.put(`/Post/update/${postId}`, { content })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })
}

// Hook 5: Deleting an entry cleanly
export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (postId) => {
      const response = await api.delete(`/Post/delete/${postId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })
}