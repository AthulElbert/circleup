import { createSlice } from "@reduxjs/toolkit";

function parseToken(token) {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalized));
    return {
      email: decoded.sub || ""
    };
  } catch {
    return null;
  }
}

const savedToken = localStorage.getItem("circleup_token") || null;
const savedUser = parseToken(savedToken);

const initialState = {
  token: savedToken,
  user: savedUser
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      state.user = parseToken(action.payload);
      localStorage.setItem("circleup_token", action.payload);
    },
    clearToken(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("circleup_token");
    }
  }
});

export const { setToken, clearToken } = authSlice.actions;
export const selectIsAuthed = (state) => Boolean(state.auth.token);
export const selectCurrentUser = (state) => state.auth.user;
export default authSlice.reducer;
