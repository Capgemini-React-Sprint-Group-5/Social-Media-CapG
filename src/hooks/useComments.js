import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queryKeys.js'
import * as commentsApi from '../api/comments.api.js'

/**
 * hooks/useComments.js  — Owner: B
 */

/**
 * Fetch all comments for a post.
 * Usage: const { data: comments } = usePostComments(postId)
 */
export function usePostComments(postId) {
  return useQuery({
    queryKey: queryKeys.comments.byPost(postId),
    queryFn:  () => commentsApi.getCommentsByPost(postId),
    enabled:  !!postId,
  })
}

/**
 * Add a comment to a post.
 * Usage:
 *   const { mutate: addComment } = useAddComment()
 *   addComment({ postId, commentData: { userId, comment_text } })
 */
export function useAddComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ commentData }) => commentsApi.createComment(commentData),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) })
    },
  })
}

/**
 * Update a comment.
 * Usage:
 *   const { mutate: edit } = useUpdateComment()
 *   edit({ commentId, commentData: { comment_text }, postId })
 */
export function useUpdateComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ commentId, commentData }) => commentsApi.updateComment(commentId, commentData),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) })
    },
  })
}

/**
 * Delete a comment from a post.
 * Usage:
 *   const { mutate: remove } = useDeleteComment()
 *   remove({ postId, commentId })
 */
export function useDeleteComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ commentId }) => commentsApi.deleteComment(commentId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) })
    },
  })
}
