import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
// import uiReducer from './slices/uiSlice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // ui:   uiReducer,
  },
});

/**
 * Typed selector helpers (optional but saves boilerplate in components):
 *   const user = useSelector(selectCurrentUser)
 */
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectActiveThread = (state) => state.ui.activeThread;
export const selectNotifPanelOpen = (state) => state.ui.notifPanelOpen;
