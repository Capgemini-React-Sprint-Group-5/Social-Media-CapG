import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queryKeys.js'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' }
})

async function hydrateCommentWithUser(commentItem) {
  if (!commentItem) return null
  const targetUserId = commentItem.userID || commentItem.userId
  try {
    const userResponse = await api.get(`/Users/${targetUserId}`)
    return {
      ...commentItem,
      user: userResponse.data?.data || userResponse.data
    }
  } catch (err) {
    return {
      ...commentItem,
      user: { username: `User #${targetUserId}`, profile_picture: "profile1.jpg" }
    }
  }
}



export function useDeleteComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (commentId) => {
      const response = await api.delete(`/Comments/${commentId}`)
      return response.data
    },
    onSuccess: () => {
      // Refreshes the comment array cache and any post counters
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })
}

export function usePostComments(postId) {
  return useQuery({
    queryKey: queryKeys.comments.byPost(postId),
    queryFn: async () => {
      if (!postId) return []
      
      const response = await api.get(`/Posts/${postId}/comments`)
      const rawComments = response.data?.data || response.data || []
      const hydrated = await Promise.all(rawComments.map(hydrateCommentWithUser))
      return hydrated.filter(Boolean)
    },
    enabled: !!postId,
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()
  return useMutation({
    
    mutationFn: async ({ postId, userId, content }) => {
      const response = await api.post(`/Posts/${postId}/comments`, {
        userID: String(userId),
        comment_text: content,
        timestamp: new Date().toISOString()
      })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byPost(variables.postId) })
      queryClient.invalidateQueries({ queryKey: ['posts'] }) // Re-evaluate total metrics counts globally
    },
  })
}