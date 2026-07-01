import { createSlice } from '@reduxjs/toolkit'

/**
 * uiSlice.js
 * Client-only UI state — nothing that came from the API lives here.
 *
 * Current slots:
 *   activeThread     — which DM conversation is open (otherUserId)
 *   notifPanelOpen   — whether the notifications dropdown is open
 */

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeThread:   null,   // otherUserId of the open DM thread
    notifPanelOpen: false,
  },
  reducers: {
    setActiveThread: (state, action) => {
      state.activeThread = action.payload  // pass otherUserId
    },
    clearActiveThread: (state) => {
      state.activeThread = null
    },
    toggleNotifPanel: (state) => {
      state.notifPanelOpen = !state.notifPanelOpen
    },
    closeNotifPanel: (state) => {
      state.notifPanelOpen = false
    },
  },
})

export const {
  setActiveThread,
  clearActiveThread,
  toggleNotifPanel,
  closeNotifPanel,
} = uiSlice.actions

export default uiSlice.reducer
