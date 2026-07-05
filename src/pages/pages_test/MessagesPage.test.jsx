import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessagesPage from '../MessagesPage'
import { renderWithProviders, mockUser, mockFriends, mockMessages } from '../../test/utils'
import * as useFriends from '../../hooks/useFriends'
import * as useMessages from '../../hooks/useMessages'

vi.mock('../../hooks/useFriends.js', () => ({
  useFriends: vi.fn(),
}))

vi.mock('../../hooks/useMessages.js', () => ({
  useConversation: vi.fn(),
  useSendMessage: vi.fn(),
  useUpdateMessage: vi.fn(),
  useDeleteMessage: vi.fn(),
}))

describe('MessagesPage', () => {
  const mockSend = vi.fn()
  const mockUpdate = vi.fn()
  const mockDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn()

    useFriends.useFriends.mockReturnValue({
      data: mockFriends,
      isLoading: false,
    })

    useMessages.useConversation.mockReturnValue({
      data: mockMessages,
      isLoading: false,
      refetch: vi.fn(),
    })

    useMessages.useSendMessage.mockReturnValue({
      mutate: mockSend,
      isPending: false,
    })

    useMessages.useUpdateMessage.mockReturnValue({
      mutate: mockUpdate,
      isPending: false,
    })

    useMessages.useDeleteMessage.mockReturnValue({
      mutate: mockDelete,
      isPending: false,
    })
  })

  it('renders friend list on left panel', () => {
    renderWithProviders(<MessagesPage />)
    expect(screen.getByText('Conversations')).toBeInTheDocument()
    expect(screen.getByText('friend1')).toBeInTheDocument()
    expect(screen.getByText('friend2')).toBeInTheDocument()
  })

  it('shows empty state when no friends', () => {
    useFriends.useFriends.mockReturnValue({
      data: [],
      isLoading: false,
    })

    renderWithProviders(<MessagesPage />)
    expect(screen.getByText('No friends to chat with.')).toBeInTheDocument()
  })

  it('selects a conversation when friend is clicked', async () => {
    renderWithProviders(<MessagesPage />)
    const friend = screen.getByText('friend1')
    fireEvent.click(friend)

    await waitFor(() => {
      // Use a more specific selector to target the conversation header
      expect(screen.getByText('friend1', { selector: '.border-bottom .fw-bold' })).toBeInTheDocument()
    })
  })

  it('displays messages in conversation', async () => {
    renderWithProviders(<MessagesPage />)
    const friend = screen.getByText('friend1')
    fireEvent.click(friend)

    await waitFor(() => {
      expect(screen.getByText('Hello!')).toBeInTheDocument()
      expect(screen.getByText('Hi there!')).toBeInTheDocument()
    })
  })

  it('sends a message', async () => {
    renderWithProviders(<MessagesPage />)
    const friend = screen.getByText('friend1')
    fireEvent.click(friend)

    const input = screen.getByPlaceholderText('Type a message…')
    await userEvent.type(input, 'Test message')

    const sendBtn = screen.getByRole('button', { name: /Send/i })
    fireEvent.click(sendBtn)

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledWith({
        userId: mockUser.userId,
        otherUserId: mockFriends[0].friendId,
        messageData: { message_text: 'Test message' },
      })
    })
  })

  it('sends message on Enter key', async () => {
    renderWithProviders(<MessagesPage />)
    const friend = screen.getByText('friend1')
    fireEvent.click(friend)

    const input = screen.getByPlaceholderText('Type a message…')
    await userEvent.type(input, 'Test message{enter}')

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalled()
    })
  })
})