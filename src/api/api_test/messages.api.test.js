import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as messagesApi from '../messages.api.js'
import client from '../client.js'

vi.mock('../client.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('messages.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getConversation', () => {
    it('fetches messages between two users', async () => {
      const mockMessages = {
        data: [
          { messageID: 1, senderID: 1, receiverID: 2, message_text: 'Hello' },
        ],
      }
      client.get.mockResolvedValueOnce(mockMessages)

      const result = await messagesApi.getConversation(1, 2)
      expect(client.get).toHaveBeenCalledWith('/Users/1/messages/2')
      expect(result).toEqual(mockMessages.data)
    })
  })

  describe('sendMessage', () => {
    it('sends a message', async () => {
      const messageData = { message_text: 'Hello!' }
      client.post.mockResolvedValueOnce({ data: {} })
      await messagesApi.sendMessage(1, 2, messageData)
      expect(client.post).toHaveBeenCalledWith('/Users/1/messages/send/2', messageData)
    })
  })

  describe('updateMessage', () => {
    it('updates a message', async () => {
      const messageData = { message_text: 'Updated!' }
      client.put.mockResolvedValueOnce({ data: {} })
      await messagesApi.updateMessage(1, messageData)
      expect(client.put).toHaveBeenCalledWith('/Messages/1', messageData)
    })
  })

  describe('deleteMessage', () => {
    it('deletes a message', async () => {
      client.delete.mockResolvedValueOnce({ data: {} })
      await messagesApi.deleteMessage(1)
      expect(client.delete).toHaveBeenCalledWith('/Messages/1')
    })
  })
})