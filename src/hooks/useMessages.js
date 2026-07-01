import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queryKeys.js'
import * as messagesApi from '../api/messages.api.js'

/**
 * hooks/useMessages.js  — Owner: D
 *
 * No WebSocket in the API — polling is used to fake a live thread.
 * refetchInterval is set to 5s on the conversation query.
 * Only poll when the tab is visible (refetchIntervalInBackground: false).
 */

/**
 * Fetch DM conversation between two users. Polls every 5 seconds.
 * Usage: const { data: messages } = useConversation(userId, otherUserId)
 */
export function useConversation(userId, otherUserId) {
  return useQuery({
    queryKey:                   queryKeys.messages.conversation(userId, otherUserId),
    queryFn:                    () => messagesApi.getConversation(userId, otherUserId),
    enabled:                    !!userId && !!otherUserId,
    refetchInterval:            5000,   // poll every 5s
    refetchIntervalInBackground: false, // pause when tab is not focused
  })
}

/**
 * Send a DM.
 * Optimistically appends to the cache before the server confirms,
 * then reconciles on settle.
 *
 * Usage:
 *   const { mutate: send } = useSendMessage()
 *   send({ userId, otherUserId, messageData: { message_text } })
 */
export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, otherUserId, messageData }) =>
      messagesApi.sendMessage(userId, otherUserId, messageData),

    // Optimistic update — append the message instantly so the UI feels fast
    onMutate: async ({ userId, otherUserId, messageData }) => {
      const key = queryKeys.messages.conversation(userId, otherUserId)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData(key)

      queryClient.setQueryData(key, (old = []) => [
        ...old,
        { messageId: Date.now(), senderID: userId, ...messageData, pending: true },
      ])

      return { previous, key } // returned as context
    },

    // On error, roll back to the snapshot captured above
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous)
      }
    },

    // Always refetch after settle so pending flag is replaced with real data
    onSettled: (_data, _err, { userId, otherUserId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversation(userId, otherUserId),
      })
    },
  })
}

/**
 * Fetch friend-to-friend thread by friendshipId.
 * Usage: const { data: messages } = useFriendMessages(friendshipId)
 */
export function useFriendMessages(friendshipId) {
  return useQuery({
    queryKey: queryKeys.messages.friendThread(friendshipId),
    queryFn:  () => messagesApi.getFriendMessages(friendshipId),
    enabled:  !!friendshipId,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  })
}

/**
 * Send a message in a friend thread.
 * Usage:
 *   const { mutate: send } = useSendFriendMessage()
 *   send({ friendshipId, messageData: { senderID, message_text } })
 */
export function useSendFriendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ friendshipId, messageData }) =>
      messagesApi.sendFriendMessage(friendshipId, messageData),
    onSuccess: (_, { friendshipId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.friendThread(friendshipId) })
    },
  })
}

/**
 * Update a message.
 * Usage:
 *   const { mutate: edit } = useUpdateMessage()
 *   edit({ messageId, messageData: { message_text } })
 */
export function useUpdateMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ messageId, messageData }) => messagesApi.updateMessage(messageId, messageData),
    onSuccess: (_, { userId, otherUserId }) => {
      if (userId && otherUserId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.messages.conversation(userId, otherUserId) 
        });
      }
    },
  })
}

/**
 * Delete a message.
 * Usage:
 *   const { mutate: remove } = useDeleteMessage()
 *   remove(messageId)
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ messageId }) => messagesApi.deleteMessage(messageId),
    onSuccess: (_, { userId, otherUserId }) => {
      if (userId && otherUserId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.messages.conversation(userId, otherUserId) 
        });
      }
    },
  })
}
