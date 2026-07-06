import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queryKeys.js'
import * as friendsApi from '../api/friends.api.js'

export function useFriends(userId) {
  return useQuery({
    queryKey: queryKeys.friends.list(userId),
    queryFn:  () => friendsApi.getFriends(userId),
    enabled:  Boolean(userId),
    staleTime: 0,
    refetchOnMount: 'always',
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
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.sent(userId) });
    },
  })
}

export function useAddFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, friendId }) =>
      friendsApi.addFriend(userId, friendId), // ✅ Now calls the correct accept endpoint
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.list(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.pending(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.sent(userId) });
    },
  });
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

export function useSentRequests(userId) {
    return useQuery({
        queryKey: queryKeys.friends.sent(userId),
        queryFn: () => friendsApi.getSentRequests(userId),
        enabled: !!userId,
    });
}

export function useCancelFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, friendId }) =>
      friendsApi.cancelFriendRequest(userId, friendId),
    onMutate: async ({ userId, friendId }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.friends.sent(userId),
      });
      const previous =
        queryClient.getQueryData(queryKeys.friends.sent(userId)) || [];
      queryClient.setQueryData(
        queryKeys.friends.sent(userId),
        (old = []) =>
          old.filter(
            (r) => Number(r.userID2) !== Number(friendId)
          )
      );
      return { previous, userId };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(
        queryKeys.friends.sent(context.userId),
        context.previous
      );
    },
    onSettled: (_data, _err, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.sent(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.pending(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.list(userId) });
    },
  });
}