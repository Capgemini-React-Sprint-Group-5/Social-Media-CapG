import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys.js";
import * as groupsApi from "../api/groups.api.js";

/**
 * hooks/useGroups.js  — Owner: E
 */

/** Fetch all groups. */
export function useAllGroups() {
  return useQuery({
    queryKey: queryKeys.groups.all(),
    queryFn: groupsApi.getAllGroups,
  });
}

/** Fetch a single group by ID. */
export function useGroup(groupId) {
  return useQuery({
    queryKey: queryKeys.groups.byId(groupId),
    queryFn: () => groupsApi.getGroupById(groupId),
    enabled: !!groupId,
  });
}

/** Fetch all groups a user belongs to. */
export function useUserGroups(userId) {
  return useQuery({
    queryKey: queryKeys.groups.byUser(userId),
    queryFn: () => groupsApi.getAllGroups(), // filtered client-side or via /api/users/:userId/groups
    enabled: !!userId,
  });
}

/** Fetch members of a group. */
export function useGroupMembers(groupId) {
  return useQuery({
    queryKey: queryKeys.groups.members(groupId),
    queryFn: () => groupsApi.getGroupMembers(groupId),
    enabled: !!groupId,
  });
}

/**
 * Fetch group messages. Polls every 5s (same pattern as DM thread).
 */
export function useGroupMessages(groupId) {
  return useQuery({
    queryKey: queryKeys.groups.messages(groupId),
    queryFn: () => groupsApi.getGroupMessages(groupId),
    enabled: !!groupId,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  });
}

/** Create a group. */
export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: groupsApi.createGroup,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all() }),
  });
}

/** Update a group. */
export function useUpdateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, groupData }) =>
      groupsApi.updateGroup(groupId, groupData),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.byId(groupId),
      });
    },
  });
}

/** Delete a group. */
export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: groupsApi.deleteGroup,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all() }),
  });
}

/** Join a group. */
export function useJoinGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }) => groupsApi.joinGroup(groupId, userId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.members(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.all(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.byId(groupId),
      });
    },
  });
}

/** Leave a group. */
export function useLeaveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }) => groupsApi.leaveGroup(groupId, userId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.members(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.all(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.byId(groupId),
      });
    },
  });
}

/** Send a message to a group. */
export function useSendGroupMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId, messageData }) =>
      groupsApi.sendGroupMessage(groupId, userId, messageData),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.messages(groupId),
      });
    },
  });
}

/** Fetch all group messages from database. */
export function useAllGroupMessages() {
  return useQuery({
    queryKey: ['groups', 'messages', 'all'],
    queryFn: groupsApi.getAllGroupMessages,
  });
}
