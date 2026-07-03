import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queryKeys.js'
import * as friendsApi from '../api/friends.api.js'

export function useFriends(userId) {
  return useQuery({
    queryKey: queryKeys.friends.list(userId),
    queryFn:  () => friendsApi.getFriends(userId),
    enabled:  !!userId,
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

export function useRemoveFriend() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, friendId }) => friendsApi.removeFriend(userId, friendId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.list(userId) })
    },
  })
}
