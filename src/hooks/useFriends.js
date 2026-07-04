import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queryKeys.js'
import * as friendsApi from '../api/friends.api.js'
import axios from 'axios'


const api = axios.create({ baseURL: 'http://localhost:3000' })

export function useFriends(userId) {
  return useQuery({
    queryKey: queryKeys.friends.list(userId),
    queryFn: async () => {
      if (!userId) return []
      // Query the dynamic relationships route
      const response = await api.get(`/Users/${userId}/friends`)
      return response.data?.data || response.data || []
    },
    enabled: !!userId,
  })
}

export function usePendingRequests(userId) {
  return useQuery({
    queryKey: queryKeys.friends.pending(userId),
    queryFn:  () => friendsApi.getPendingRequests(userId),
    enabled:  !!userId,
  })
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, friendId }) => friendsApi.sendFriendRequest(userId, friendId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.pending(userId) })
    },
  })
}


export function useAddFriend() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, friendId }) => friendsApi.addFriend(userId, friendId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.list(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.pending(userId) })
    },
  })
}

/**
 * Remove a friend.
 * Usage:
 *   const { mutate: remove } = useRemoveFriend()
 *   remove({ userId, friendId })
 */
export function useRemoveFriend() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, friendId }) => friendsApi.removeFriend(userId, friendId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.list(userId) })
    },
  })
}
