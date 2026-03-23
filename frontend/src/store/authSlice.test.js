import { describe, expect, it } from "vitest";
import authReducer, { clearToken, setToken } from "./authSlice.js";

describe("authSlice", () => {
  it("stores token and parses user email", () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGNpcmNsZXVwLmNvbSJ9.signature";

    const state = authReducer(undefined, setToken(token));

    expect(state.token).toBe(token);
    expect(state.user.email).toBe("test@circleup.com");
  });

  it("clears token and user", () => {
    const initialState = {
      token: "token",
      user: { email: "test@circleup.com" }
    };

    const state = authReducer(initialState, clearToken());

    expect(state.token).toBe(null);
    expect(state.user).toBe(null);
  });
});
