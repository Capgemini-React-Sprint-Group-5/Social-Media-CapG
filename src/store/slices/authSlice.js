import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("smp_user");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    isAuthenticated: !!storedUser,
  },
  reducers: {
    setUser: (state, action) => {
      if (action.payload?.userId == null) {
        console.error(
          "setUser called without a userId — ignoring payload:",
          action.payload,
        );
        return;
      }
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("smp_user", JSON.stringify(action.payload));
    },

    /* Call on logout or when the looked-up user is not found. */
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("smp_user");
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
