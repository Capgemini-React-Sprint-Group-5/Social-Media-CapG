import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queryKeys.js'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' }
})


export function usePostLikes(postId) {
  return useQuery({
    queryKey: queryKeys.likes.byPost(postId),
    queryFn: async () => {
      const response = await api.get(`/Posts/${postId}/likes`)
      return response.data?.data || []
    },
    enabled: !!postId,
  })
}


export function useGivenLikes(userId) {
  return useQuery({
    queryKey: queryKeys.likes.givenByUser(userId),
    queryFn: async () => {
      const response = await api.get(`/Users/${userId}/likes`)
      return response.data?.data || []
    },
    enabled: !!userId,
  })
}


export function useAddLike() {
  const queryClient = useQueryClient();
  return useMutation({
    // FIXED: Formats the exact path parameter endpoint required by posts.routes.js
    mutationFn: async ({ postId, userId }) => {
      const response = await api.post(`/Posts/${postId}/likes/add/${userId}`)
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate the post-specific caches and the home feed timeline to update states instantly
      queryClient.invalidateQueries({ queryKey: queryKeys.likes.byPost(variables.postId) })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  });
}

export function useRemoveLike() {
  const queryClient = useQueryClient();
  return useMutation({
    
    mutationFn: async ({ postId, likeId }) => {
      const response = await api.delete(`/Posts/${postId}/likes/remove/${likeId}`)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.likes.byPost(variables.postId) })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
