import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queryKeys.js'
import * as likesApi from '../api/likes.api.js'
import * as usersApi from '../api/users.api.js'

/**
 * hooks/useLikes.js  — Owner: B
 */

/**
 * Fetch all likes on a post.
 * Usage: const { data: likes } = usePostLikes(postId)
 */
export function usePostLikes(postId) {
  return useQuery({
    queryKey: queryKeys.likes.byPost(postId),
    queryFn:  () => likesApi.getLikesByPost(postId),
    enabled:  !!postId,
  })
}

/**
 * Fetch all likes a user has given.
 * Usage: const { data: likes } = useGivenLikes(userId)
 */
export function useGivenLikes(userId) {
  return useQuery({
    queryKey: queryKeys.likes.givenByUser(userId),
    queryFn:  () => usersApi.getUserGivenLikes(userId),
    enabled:  !!userId,
  })
}

/**
 * Fetch all likes received on a user's posts.
 * Usage: const { data: likes } = useReceivedLikes(userId)
 */
export function useReceivedLikes(userId) {
  return useQuery({
    queryKey: queryKeys.likes.receivedByUser(userId),
    queryFn:  () => usersApi.getUserPostLikes(userId),
    enabled:  !!userId,
  })
}

/**
 * Like a post.
 * Usage:
 *   const { mutate: like } = useAddLike()
 *   like({ postId, userId })
 */
export function useAddLike() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, userId }) => likesApi.addLike(postId, userId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.likes.byPost(postId) })
    },
  })
}

/**
 * Remove a like from a post.
 * Usage:
 *   const { mutate: unlike } = useRemoveLike()
 *   unlike({ postId, likeId })
 */
export function useRemoveLike() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ likeId }) => likesApi.removeLike(likeId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.likes.byPost(postId) })
    },
  })
}
