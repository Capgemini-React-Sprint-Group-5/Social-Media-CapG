import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as friendsApi from '../friends.api.js'
import client from '../client.js'

vi.mock('../client.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('friends.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getFriends', () => {
    it('fetches and enriches friends with user data', async () => {
      const mockFriends = {
        data: [
          { friendshipID: 1, friendId: 2, status: 'accepted' },
          { friendshipID: 2, friendId: 3, status: 'pending' },
        ],
      }
      const mockUsers = {
        data: [
          { userID: 2, username: 'friend1', email: 'f1@test.com' },
          { userID: 3, username: 'friend2', email: 'f2@test.com' },
        ],
      }

      client.get
        .mockResolvedValueOnce(mockFriends)
        .mockResolvedValueOnce(mockUsers)

      const result = await friendsApi.getFriends(1)

      expect(client.get).toHaveBeenCalledWith('/Users/1/friends')
      expect(client.get).toHaveBeenCalledWith('/Users/all')
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        friendshipId: 1,
        friendId: 2,
        username: 'friend1',
        email: 'f1@test.com',
        profile_picture: undefined,
      })
    })
  })

  describe('sendFriendRequest', () => {
    it('sends a friend request', async () => {
      client.post.mockResolvedValueOnce({ data: {} })
      await friendsApi.sendFriendRequest(1, 2)
      expect(client.post).toHaveBeenCalledWith('/Users/1/friend-requests/send/2')
    })
  })

  describe('addFriend', () => {
    it('accepts a friend request', async () => {
      client.post.mockResolvedValueOnce({ data: {} })
      await friendsApi.addFriend(1, 2)
      expect(client.post).toHaveBeenCalledWith('/Users/1/friends/2')
    })
  })

  describe('removeFriend', () => {
    it('removes a friend', async () => {
      client.delete.mockResolvedValueOnce({ data: {} })
      await friendsApi.removeFriend(1, 2)
      expect(client.delete).toHaveBeenCalledWith('/Users/1/friends/2')
    })
  })

  describe('getSentRequests', () => {
    it('fetches sent friend requests', async () => {
      const mockSent = {
        data: [
          { userID1: 1, userID2: 2, status: 'pending' },
          { userID1: 1, userID2: 3, status: 'pending' },
        ],
      }
      client.get.mockResolvedValueOnce(mockSent)

      const result = await friendsApi.getSentRequests(1)
      expect(client.get).toHaveBeenCalledWith('/Users/1/friend-requests/sent')
      expect(result).toEqual(mockSent.data)
    })
  })

  describe('cancelFriendRequest', () => {
    it('cancels a friend request', async () => {
      client.delete.mockResolvedValueOnce({ data: {} })
      await friendsApi.cancelFriendRequest(1, 2)
      expect(client.delete).toHaveBeenCalledWith('/Users/1/friend-requests/cancel/2')
    })
  })
})