import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("circleup_token") || null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      localStorage.setItem("circleup_token", action.payload);
    },
    clearToken(state) {
      state.token = null;
      localStorage.removeItem("circleup_token");
    }
  }
});

export const { setToken, clearToken } = authSlice.actions;
export const selectIsAuthed = (state) => Boolean(state.auth.token);
export default authSlice.reducer;
