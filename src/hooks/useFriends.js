import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queryKeys.js'
import * as friendsApi from '../api/friends.api.js'

/**
 * hooks/useFriends.js  — Owner: C
 *
 * NOTE: useFriends(userId) is the contract hook that usePosts.js (B) imports
 * for building the Home Feed. Publish the stub early on D1 even if the full
 * Friends page UI isn't done yet — B needs the shape.
 *
 * Expected shape of each item in the returned array:
 *   { friendId, username, ...anyOtherUserFields }
 */

/**
 * Fetch friends list for a user.
 * Usage: const { data: friends } = useFriends(userId)
 */
export function useFriends(userId) {
  return useQuery({
    queryKey: queryKeys.friends.list(userId),
    queryFn:  () => friendsApi.getFriends(userId),
    enabled:  !!userId,
  })
}

/**
 * Fetch pending friend requests.
 * Usage: const { data: pending } = usePendingRequests(userId)
 */
export function usePendingRequests(userId) {
  return useQuery({
    queryKey: queryKeys.friends.pending(userId),
    queryFn:  () => friendsApi.getPendingRequests(userId),
    enabled:  !!userId,
  })
}

/**
 * Send a friend request.
 * Usage:
 *   const { mutate: send } = useSendFriendRequest()
 *   send({ userId, friendId })
 */
export function useSendFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, friendId }) => friendsApi.sendFriendRequest(userId, friendId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.pending(userId) })
    },
  })
}

/**
 * Add a friend (accept request / direct add).
 * Usage:
 *   const { mutate: add } = useAddFriend()
 *   add({ userId, friendId })
 */
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
