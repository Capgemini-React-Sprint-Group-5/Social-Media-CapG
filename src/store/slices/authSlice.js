import { createSlice } from '@reduxjs/toolkit'

/**
 * authSlice.js
 *
 * MOCK AUTH — no real JWT. The backend has no login endpoint.
 * "Login" = search user by username via API, confirm they exist,
 * then store { userId, username } here as the session.
 *
 * Persisted to localStorage under key 'smp_user' so page refresh
 * doesn't log the user out.
 */

const storedUser = localStorage.getItem('smp_user')

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            storedUser ? JSON.parse(storedUser) : null,
    isAuthenticated: !!storedUser,
  },
  reducers: {
    /**
     * Call after a successful user lookup.
     * payload: { userId, username, email?, profile_picture? }
     */
    setUser: (state, action) => {
      state.user            = action.payload
      state.isAuthenticated = true
      localStorage.setItem('smp_user', JSON.stringify(action.payload))
    },

    /** Call on logout or when the looked-up user is not found. */
    clearUser: (state) => {
      state.user            = null
      state.isAuthenticated = false
      localStorage.removeItem('smp_user')
    },
  },
})

export const { setUser, clearUser } = authSlice.actions
export default authSlice.reducer
