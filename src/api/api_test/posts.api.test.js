import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as postsApi from '../posts.api.js'
import client from '../client.js'

vi.mock('../client.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('posts.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPostById', () => {
    it('fetches a post by ID', async () => {
      const mockPost = { data: { postID: 1, content: 'Test' } }
      client.get.mockResolvedValueOnce(mockPost)
      const result = await postsApi.getPostById(1)
      expect(client.get).toHaveBeenCalledWith('/Post/1')
      expect(result).toEqual(mockPost.data)
    })
  })

  describe('createPost', () => {
    it('creates a new post', async () => {
      const postData = { userId: 1, content: 'New post' }
      client.post.mockResolvedValueOnce({ data: {} })
      await postsApi.createPost(postData)
      expect(client.post).toHaveBeenCalledWith('/Post', postData)
    })
  })

  describe('updatePost', () => {
    it('updates a post', async () => {
      const postData = { content: 'Updated!' }
      client.put.mockResolvedValueOnce({ data: {} })
      await postsApi.updatePost(1, postData)
      expect(client.put).toHaveBeenCalledWith('/Post/update/1', postData)
    })
  })

  describe('deletePost', () => {
    it('deletes a post', async () => {
      client.delete.mockResolvedValueOnce({ data: {} })
      await postsApi.deletePost(1)
      expect(client.delete).toHaveBeenCalledWith('/Post/delete/1')
    })
  })

  describe('getPostsByUser', () => {
    it('fetches all posts by a user', async () => {
      const mockPosts = { data: [{ postID: 1 }, { postID: 2 }] }
      client.get.mockResolvedValueOnce(mockPosts)
      const result = await postsApi.getPostsByUser(1)
      expect(client.get).toHaveBeenCalledWith('/Users/1/posts')
      expect(result).toEqual(mockPosts.data)
    })
  })
})