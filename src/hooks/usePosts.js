import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../store/index.js'
import { queryKeys } from '../queryKeys.js'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' }
})

async function hydratePostWithUser(postItem) {
  if (!postItem) return null
  const targetUserId = postItem.userID
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

export function useFriendsFeed() {
  const currentUser = useSelector(selectCurrentUser)
  const userId = currentUser?.userID || currentUser?.userId || currentUser?.id

  const friendsQuery = useQuery({
    queryKey: queryKeys.friends.list(userId),
    queryFn: async () => {
      const response = await api.get(`/Users/${userId}/friends`)
      return response.data?.data || []
    },
    enabled: !!userId,
  })

  const acceptedFriends = (friendsQuery.data || []).filter((f) => f.status === 'accepted')

  const currentUserPostsQuery = useQuery({
    queryKey: queryKeys.posts.byUser(userId),
    queryFn: async () => {
      const response = await api.get(`/Users/${userId}/posts`)
      const rawPosts = response.data?.data || []
      return await Promise.all(rawPosts.map(hydratePostWithUser))
    },
    enabled: !!userId,
  })

  const postQueries = useQueries({
    queries: acceptedFriends.map((friend) => {
      const targetFriendId = friend.friendId
      return {
        queryKey: queryKeys.posts.byUser(targetFriendId),
        queryFn: async () => {
          const response = await api.get(`/Users/${targetFriendId}/posts`)
          const rawPosts = response.data?.data || []
          return await Promise.all(rawPosts.map(hydratePostWithUser))
        },
        enabled: !!targetFriendId,
      }
    }),
  })

  const myPosts = currentUserPostsQuery.data || []
  const friendsPosts = postQueries.flatMap((q) => q.data || [])

  const posts = [...myPosts, ...friendsPosts]
    .filter(Boolean)
    .sort((a, b) => {
      const timeA = a.timestamp === 'NOW()' ? Date.now() : new Date(a.timestamp).getTime()
      const timeB = b.timestamp === 'NOW()' ? Date.now() : new Date(b.timestamp).getTime()
      return timeB - timeA
    })

  const isLoading = friendsQuery.isLoading || currentUserPostsQuery.isLoading || postQueries.some((q) => q.isLoading)
  const isError = friendsQuery.isError || currentUserPostsQuery.isError || postQueries.some((q) => q.isError)

  return { posts, isLoading, isError }
}

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
      // Clear cache arrays completely to instantly force a timeline reload
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

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