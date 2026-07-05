import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import {
  useFriends,
  usePendingRequests,
  useSentRequests,
  useSendFriendRequest,
  useAddFriend,
  useRemoveFriend,
  useCancelFriendRequest,
} from '../useFriends'
import * as friendsApi from '../../api/friends.api'
import { createWrapper, mockFriends, mockPending, mockSentRequests } from '../../test/utils'

vi.mock('../../api/friends.api.js', () => ({
  getFriends: vi.fn(),
  getPendingRequests: vi.fn(),
  getSentRequests: vi.fn(),
  sendFriendRequest: vi.fn(),
  addFriend: vi.fn(),
  removeFriend: vi.fn(),
  cancelFriendRequest: vi.fn(),
}))

describe('useFriends', () => {
  let queryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  describe('useFriends', () => {
    it('fetches friends when userId is provided', async () => {
      friendsApi.getFriends.mockResolvedValue(mockFriends)

      const { result } = renderHook(() => useFriends(1), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockFriends)
      expect(friendsApi.getFriends).toHaveBeenCalledWith(1)
    })

    it('does not fetch when userId is falsy', () => {
      renderHook(() => useFriends(null), {
        wrapper: createWrapper(),
      })

      expect(friendsApi.getFriends).not.toHaveBeenCalled()
    })
  })

  describe('usePendingRequests', () => {
    it('fetches pending requests when userId is provided', async () => {
      friendsApi.getPendingRequests.mockResolvedValue(mockPending)

      const { result } = renderHook(() => usePendingRequests(1), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockPending)
      expect(friendsApi.getPendingRequests).toHaveBeenCalledWith(1)
    })
  })

  describe('useSentRequests', () => {
    it('fetches sent requests when userId is provided', async () => {
      friendsApi.getSentRequests.mockResolvedValue(mockSentRequests)

      const { result } = renderHook(() => useSentRequests(1), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockSentRequests)
      expect(friendsApi.getSentRequests).toHaveBeenCalledWith(1)
    })
  })

  describe('useSendFriendRequest', () => {
    it('sends a friend request and invalidates queries', async () => {
      friendsApi.sendFriendRequest.mockResolvedValue({ data: {} })

      const { result } = renderHook(() => useSendFriendRequest(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ userId: 1, friendId: 2 })

      await waitFor(() => {
        expect(friendsApi.sendFriendRequest).toHaveBeenCalledWith(1, 2)
      })
    })
  })

  describe('useAddFriend', () => {
    it('accepts a friend request and invalidates queries', async () => {
      friendsApi.addFriend.mockResolvedValue({ data: {} })

      const { result } = renderHook(() => useAddFriend(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ userId: 1, friendId: 2 })

      await waitFor(() => {
        expect(friendsApi.addFriend).toHaveBeenCalledWith(1, 2)
      })
    })
  })

  describe('useRemoveFriend', () => {
    it('removes a friend and invalidates queries', async () => {
      friendsApi.removeFriend.mockResolvedValue({ data: {} })

      const { result } = renderHook(() => useRemoveFriend(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ userId: 1, friendId: 2 })

      await waitFor(() => {
        expect(friendsApi.removeFriend).toHaveBeenCalledWith(1, 2)
      })
    })
  })

  describe('useCancelFriendRequest', () => {
    it('cancels a friend request with optimistic update', async () => {
      friendsApi.cancelFriendRequest.mockResolvedValue({ data: {} })

      const { result } = renderHook(() => useCancelFriendRequest(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ userId: 1, friendId: 2 })

      await waitFor(() => {
        expect(friendsApi.cancelFriendRequest).toHaveBeenCalledWith(1, 2)
      })
    })
  })
})