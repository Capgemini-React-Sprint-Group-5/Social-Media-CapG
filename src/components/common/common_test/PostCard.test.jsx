import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import PostCard from '../PostCard'
import { renderWithProviders, mockUser, mockPosts, mockComments, mockLikes } from '../../../test/utils'
import * as useLikes from '../../../hooks/useLikes'
import * as useComments from '../../../hooks/useComments'
import * as usePosts from '../../../hooks/usePosts'

vi.mock('../../../hooks/useLikes.js', () => ({
  usePostLikes: vi.fn(),
  useAddLike: vi.fn(),
  useRemoveLike: vi.fn(),
}))

vi.mock('../../../hooks/useComments.js', () => ({
  usePostComments: vi.fn(),
  useAddComment: vi.fn(),
}))

vi.mock('../../../hooks/usePosts.js', () => ({
  useUpdatePost: vi.fn(),
  useDeletePost: vi.fn(),
}))

describe('PostCard', () => {
  const mockPost = mockPosts[0]
  const mockMutate = vi.fn()
  const mockRefetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    useLikes.usePostLikes.mockReturnValue({
      data: mockLikes,
      refetch: mockRefetch,
    })

    useLikes.useAddLike.mockReturnValue({
      mutateAsync: mockMutate,
      isPending: false,
    })

    useLikes.useRemoveLike.mockReturnValue({
      mutateAsync: mockMutate,
      isPending: false,
    })

    useComments.usePostComments.mockReturnValue({
      data: mockComments,
      refetch: mockRefetch,
    })

    useComments.useAddComment.mockReturnValue({
      mutateAsync: mockMutate,
      isPending: false,
    })

    usePosts.useUpdatePost.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })

    usePosts.useDeletePost.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })
  })

  it('renders post content and author info', () => {
    renderWithProviders(<PostCard post={mockPost} />)
    expect(screen.getByText('testuser')).toBeInTheDocument()
    expect(screen.getByText('First post!')).toBeInTheDocument()
  })

  it('shows comment count', () => {
    renderWithProviders(<PostCard post={mockPost} />)
    expect(screen.getByText('2')).toBeInTheDocument() // Comment count
  })
})