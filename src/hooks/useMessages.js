import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queryKeys.js'
import * as messagesApi from '../api/messages.api.js'

export function useConversation(userId, otherUserId) {
  return useQuery({
    queryKey:                   queryKeys.messages.conversation(userId, otherUserId),
    queryFn:                    () => messagesApi.getConversation(userId, otherUserId),
    enabled:                    !!userId && !!otherUserId,
    refetchInterval:            5000,
    refetchIntervalInBackground: false,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, otherUserId, messageData }) =>
      messagesApi.sendMessage(userId, otherUserId, messageData),
    onMutate: async ({ userId, otherUserId, messageData }) => {
      const key = queryKeys.messages.conversation(userId, otherUserId)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData(key)

      queryClient.setQueryData(key, (old = []) => [
        ...old,
        { messageID: Date.now(), senderID: userId, ...messageData, pending: true },
      ])

      return { previous, key }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous)
      }
    },
    onSettled: (_data, _err, { userId, otherUserId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversation(userId, otherUserId),
      })
    },
  })
}

export function useFriendMessages(friendshipId) {
  return useQuery({
    queryKey: queryKeys.messages.friendThread(friendshipId),
    queryFn:  () => messagesApi.getFriendMessages(friendshipId),
    enabled:  !!friendshipId,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  })
}

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
