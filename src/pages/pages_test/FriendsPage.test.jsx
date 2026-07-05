import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FriendsPage from '../FriendsPage'
import { renderWithProviders, mockUser, mockFriends, mockPending, mockSentRequests } from '../../test/utils'
import * as useFriends from '../../hooks/useFriends'
import * as useUsers from '../../hooks/useUsers'

vi.mock('../../hooks/useFriends.js', () => ({
  useFriends: vi.fn(),
  usePendingRequests: vi.fn(),
  useSentRequests: vi.fn(),
  useAddFriend: vi.fn(),
  useRemoveFriend: vi.fn(),
  useSendFriendRequest: vi.fn(),
  useCancelFriendRequest: vi.fn(),
}))

vi.mock('../../hooks/useUsers.js', () => ({
  useUserSearch: vi.fn(),
}))

describe('FriendsPage', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    useFriends.useFriends.mockReturnValue({
      data: mockFriends,
      isLoading: false,
      refetch: vi.fn(),
    })

    useFriends.usePendingRequests.mockReturnValue({
      data: mockPending,
      isLoading: false,
      refetch: vi.fn(),
    })

    useFriends.useSentRequests.mockReturnValue({
      data: mockSentRequests,
    })

    useFriends.useAddFriend.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })

    useFriends.useRemoveFriend.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })

    useFriends.useSendFriendRequest.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })

    useFriends.useCancelFriendRequest.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })

    useUsers.useUserSearch.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    })
  })

  it('renders friends tab by default', () => {
    renderWithProviders(<FriendsPage />)
    expect(screen.getByText('My Friends')).toBeInTheDocument()
    expect(screen.getByText('friend1')).toBeInTheDocument()
    expect(screen.getByText('friend2')).toBeInTheDocument()
  })

  it('switches to pending tab', async () => {
    renderWithProviders(<FriendsPage />)
    const pendingTab = screen.getByRole('button', { name: /Pending/i })
    fireEvent.click(pendingTab)

    await waitFor(() => {
      expect(screen.getByText('Pending Requests')).toBeInTheDocument()
      expect(screen.getByText('pendingUser')).toBeInTheDocument()
    })
  })

  it('shows empty state when no friends', () => {
    useFriends.useFriends.mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<FriendsPage />)
    expect(screen.getByText(/You haven't added any friends yet/i)).toBeInTheDocument()
  })

  it('calls removeFriend when remove button clicked', async () => {
    const mockRemove = vi.fn()
    useFriends.useRemoveFriend.mockReturnValue({
      mutate: mockRemove,
      isPending: false,
    })

    renderWithProviders(<FriendsPage />)
    const removeBtn = screen.getAllByText(/Remove/i)[0]
    fireEvent.click(removeBtn)

    expect(window.confirm).toHaveBeenCalledWith('Remove this friend?')
    expect(mockRemove).toHaveBeenCalledWith(
      { userId: mockUser.userId, friendId: mockFriends[0].friendId },
      expect.any(Object)
    )
  })

  it('shows "Add Friend" button for non-friend in search results', async () => {
    const searchResult = [{ userID: 99, username: 'newuser', email: 'new@example.com' }]
    useUsers.useUserSearch.mockReturnValue({
      data: searchResult,
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<FriendsPage />)
    fireEvent.click(screen.getByRole('button', { name: /Find People/i }))

    const searchInput = screen.getByPlaceholderText(/Search by username/i)
    await userEvent.type(searchInput, 'newuser')

    await waitFor(() => {
      expect(screen.getByText('newuser')).toBeInTheDocument()
      const addBtn = screen.getByRole('button', { name: /Add Friend/i })
      expect(addBtn).toBeInTheDocument()
    })
  })

  it('shows "Cancel Request" button for sent requests', async () => {
    const searchResult = [{ userID: 5, username: 'requestedUser', email: 'ru@example.com' }]
    useUsers.useUserSearch.mockReturnValue({
      data: searchResult,
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<FriendsPage />)
    fireEvent.click(screen.getByRole('button', { name: /Find People/i }))

    const searchInput = screen.getByPlaceholderText(/Search by username/i)
    await userEvent.type(searchInput, 'requestedUser')

    await waitFor(() => {
      expect(screen.getByText('requestedUser')).toBeInTheDocument()
      const cancelBtn = screen.getByRole('button', { name: /Cancel Request/i })
      expect(cancelBtn).toBeInTheDocument()
    })
  })

  it('handles accept request in pending tab', async () => {
    const mockAccept = vi.fn()
    useFriends.useAddFriend.mockReturnValue({
      mutate: mockAccept,
      isPending: false,
    })

    renderWithProviders(<FriendsPage />)
    fireEvent.click(screen.getByRole('button', { name: /Pending/i }))

    const acceptBtn = screen.getByRole('button', { name: /Accept/i })
    fireEvent.click(acceptBtn)

    await waitFor(() => {
      expect(mockAccept).toHaveBeenCalledWith(
        { userId: mockUser.userId, friendId: mockPending[0].friendId },
        expect.any(Object)
      )
    })
  })

  it('handles decline request in pending tab', async () => {
    const mockDecline = vi.fn()
    useFriends.useRemoveFriend.mockReturnValue({
      mutate: mockDecline,
      isPending: false,
    })

    renderWithProviders(<FriendsPage />)
    fireEvent.click(screen.getByRole('button', { name: /Pending/i }))

    const declineBtn = screen.getByRole('button', { name: /Decline/i })
    fireEvent.click(declineBtn)

    await waitFor(() => {
      expect(mockDecline).toHaveBeenCalledWith(
        { userId: mockUser.userId, friendId: mockPending[0].friendId },
        expect.any(Object)
      )
    })
  })
})