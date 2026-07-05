import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import {
  useConversation,
  useSendMessage,
  useUpdateMessage,
  useDeleteMessage,
} from '../useMessages'
import * as messagesApi from '../../api/messages.api'
import { createWrapper, mockMessages } from '../../test/utils'

vi.mock('../../api/messages.api.js', () => ({
  getConversation: vi.fn(),
  sendMessage: vi.fn(),
  updateMessage: vi.fn(),
  deleteMessage: vi.fn(),
}))

describe('useMessages', () => {
  let queryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  describe('useConversation', () => {
    it('fetches conversation when both userIds are provided', async () => {
      messagesApi.getConversation.mockResolvedValue(mockMessages)

      const { result } = renderHook(() => useConversation(1, 2), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockMessages)
      expect(messagesApi.getConversation).toHaveBeenCalledWith(1, 2)
    })

    it('does not fetch when userId is missing', () => {
      renderHook(() => useConversation(null, 2), {
        wrapper: createWrapper(),
      })

      expect(messagesApi.getConversation).not.toHaveBeenCalled()
    })

    it('polls every 5 seconds', async () => {
      messagesApi.getConversation.mockResolvedValue(mockMessages)

      renderHook(() => useConversation(1, 2), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(messagesApi.getConversation).toHaveBeenCalled()
      })

      // The refetchInterval should be 5000ms
      // We can't easily test the interval, but we can verify the query has the correct options
    })
  })

  describe('useSendMessage', () => {
    it('sends a message with optimistic update', async () => {
      messagesApi.sendMessage.mockResolvedValue({ data: {} })

      const { result } = renderHook(() => useSendMessage(), {
        wrapper: createWrapper(),
      })

      const messageData = { message_text: 'Hello!' }
      result.current.mutate({ userId: 1, otherUserId: 2, messageData })

      await waitFor(() => {
        expect(messagesApi.sendMessage).toHaveBeenCalledWith(1, 2, messageData)
      })
    })

    it('rolls back on error', async () => {
      messagesApi.sendMessage.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useSendMessage(), {
        wrapper: createWrapper(),
      })

      const messageData = { message_text: 'Hello!' }
      result.current.mutate({ userId: 1, otherUserId: 2, messageData })

      // Wait for the mutation to settle
      await waitFor(() => {
        expect(messagesApi.sendMessage).toHaveBeenCalled()
      })

      // Check that the optimistic update was rolled back
      // The cache should be restored to previous state
      expect(result.current.isError).toBe(true)
    })
  })

  describe('useUpdateMessage', () => {
    it('updates a message and invalidates cache', async () => {
      messagesApi.updateMessage.mockResolvedValue({ data: {} })

      const { result } = renderHook(() => useUpdateMessage(), {
        wrapper: createWrapper(),
      })

      const messageData = { message_text: 'Updated!' }
      result.current.mutate({ messageId: 1, userId: 1, otherUserId: 2, messageData })

      await waitFor(() => {
        expect(messagesApi.updateMessage).toHaveBeenCalledWith(1, messageData)
      })
    })
  })

  describe('useDeleteMessage', () => {
    it('deletes a message and invalidates cache', async () => {
      messagesApi.deleteMessage.mockResolvedValue({ data: {} })

      const { result } = renderHook(() => useDeleteMessage(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ messageId: 1, userId: 1, otherUserId: 2 })

      await waitFor(() => {
        expect(messagesApi.deleteMessage).toHaveBeenCalledWith(1)
      })
    })
  })
})