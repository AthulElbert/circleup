import { afterEach, describe, expect, it } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render, screen } from "@testing-library/react";
import Layout from "./Layout.jsx";
import authReducer from "../store/authSlice.js";

function renderWithStore(preloadedState) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState
  });

  return render(
    <Provider store={store}>
      <Layout>
        <div>Page body</div>
      </Layout>
    </Provider>
  );
}

afterEach(cleanup);

describe("Layout", () => {
  it("shows auth entry links when signed out", () => {
    renderWithStore({ auth: { token: null, user: null } });

    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Verify OTP" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get started" })).toBeInTheDocument();
  });

  it("shows signed-in identity and logout when authenticated", () => {
    renderWithStore({
      auth: {
        token: "header.payload.signature",
        user: { email: "host@circleup.com" }
      }
    });

    expect(screen.getByText("host@circleup.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });
});
