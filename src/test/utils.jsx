import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import authReducer from '../store/slices/authSlice.js'
import uiReducer from '../store/slices/uiSlice.js'

// ── Mock Data ────────────────────────────────────────────────────────────

export const mockUser = {
  userId: 1,
  userID: 1,
  username: 'testuser',
  email: 'test@example.com',
  profile_picture: 'profile.jpg',
}

export const mockFriends = [
  {
    friendshipId: 1,
    friendId: 2,
    userId: 2,
    username: 'friend1',
    email: 'f1@example.com',
    profile_picture: '',
  },
  {
    friendshipId: 2,
    friendId: 3,
    userId: 3,
    username: 'friend2',
    email: 'f2@example.com',
    profile_picture: '',
  },
]

export const mockPending = [
  {
    friendshipId: 3,
    friendId: 4,
    userId: 4,
    username: 'pendingUser',
    email: 'pu@example.com',
    profile_picture: '',
  },
]

export const mockSentRequests = [
  { userID1: 1, userID2: 5, status: 'pending' },
]

export const mockPosts = [
  {
    postID: 1,
    userID: 1,
    content: 'First post!',
    timestamp: new Date().toISOString(),
    user: mockUser,
  },
  {
    postID: 2,
    userID: 2,
    content: 'Second post from friend!',
    timestamp: new Date(Date.now() - 10000).toISOString(),
    user: { userId: 2, username: 'friend1', profile_picture: '' },
  },
]

export const mockComments = [
  {
    commentID: 1,
    postID: 1,
    userID: 2,
    comment_text: 'Great post!',
    timestamp: new Date().toISOString(),
    user: { userId: 2, username: 'friend1', profile_picture: '' },
  },
  {
    commentID: 2,
    postID: 1,
    userID: 1,
    comment_text: 'Thanks!',
    timestamp: new Date().toISOString(),
    user: mockUser,
  },
]

export const mockLikes = [
  { likeID: 1, postID: 1, userID: 2 },
  { likeID: 2, postID: 1, userID: 3 },
]

export const mockMessages = [
  {
    messageID: 1,
    senderID: 1,
    receiverID: 2,
    message_text: 'Hello!',
    timestamp: new Date().toISOString(),
  },
  {
    messageID: 2,
    senderID: 2,
    receiverID: 1,
    message_text: 'Hi there!',
    timestamp: new Date(Date.now() - 5000).toISOString(),
  },
]

// ── Store Factory ────────────────────────────────────────────────────────

export const createTestStore = (overrides = {}) => {
  const defaultState = {
    auth: {
      user: mockUser,
      isAuthenticated: true,
    },
    ui: {
      activeThread: null,
      notifPanelOpen: false,
    },
  }

  const mergedState = {
    auth: { ...defaultState.auth, ...overrides.auth },
    ui: { ...defaultState.ui, ...overrides.ui },
  }

  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
    },
    preloadedState: mergedState,
  })
}

// ── Test Wrapper ─────────────────────────────────────────────────────────

export const renderWithProviders = (
  ui,
  {
    store = createTestStore(),
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    }),
    route = '/',
    ...renderOptions
  } = {}
) => {
  window.history.pushState({}, 'Test page', route)

  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    </Provider>
  )

  return {
    store,
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// ── Hook Test Helper ─────────────────────────────────────────────────────

export const createWrapper = (store = createTestStore()) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Provider>
  )
}

// ── Utility Functions ──────────────────────────────────────────────────

export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0))