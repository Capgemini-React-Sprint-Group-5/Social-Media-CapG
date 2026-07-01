import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys.js";
import * as usersApi from "../api/users.api.js";

/**
 * hooks/useUsers.js  — Owner: A
 *
 * Pattern used throughout all hook files:
 *   useQuery  → read data from API, cached by queryKey
 *   useMutation → write/delete, then invalidate affected query keys
 */

/**
 * Fetch a single user by ID.
 * Usage: const { data: user, isLoading, error } = useUser(userId)
 */
export function useUser(userId) {
  return useQuery({
    queryKey: queryKeys.users.byId(userId),
    queryFn: () => usersApi.getUserById(userId),
    enabled: !!userId, // don't fire if userId is null/undefined
  });
}

// ── STUBS — implement following the pattern above ─────────────────────────

/**
 * Fetch all users.
 * Usage: const { data: users } = useAllUsers()
 */
export function useAllUsers() {
  return useQuery({
    queryKey: queryKeys.users.all(),
    queryFn: usersApi.getAllUsers,
  });
}

/**
 * Search users by username string.
 * Usage: const { data } = useUserSearch(username)
 */
export function useUserSearch(username) {
  return useQuery({
    queryKey: queryKeys.users.search(username),
    queryFn: () => usersApi.searchUsers(username),
    enabled: !!username && username.trim().length > 0,
  });
}

/**
 * Login user (Sign in).
 * Usage:
 *   const { mutate: login, isPending } = useLoginUser()
 *   login({ username, password })
 */
export function useLoginUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials) => usersApi.loginUser(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
  });
}

/**
 * Create a new user (Register).
 * Usage:
 *   const { mutate: register, isPending } = useCreateUser()
 *   register({ username, email, password })
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
  });
}

/**
 * Update a user's profile.
 * Usage:
 *   const { mutate: update } = useUpdateUser()
 *   update({ userId, userData: { username, email } })
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, userData }) => usersApi.updateUser(userId, userData),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.byId(userId) });
    },
  });
}

/**
 * Delete a user.
 * Usage:
 *   const { mutate: remove } = useDeleteUser()
 *   remove(userId)
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
  });
}
