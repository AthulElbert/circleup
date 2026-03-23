import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import AuthGate from "./AuthGate.jsx";
import authReducer from "../store/authSlice.js";

function renderWithStore(token) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        token,
        user: token ? { email: "test@circleup.com" } : null
      }
    }
  });

  return render(
    <Provider store={store}>
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>
    </Provider>
  );
}

describe("AuthGate", () => {
  it("renders login prompt when unauthenticated", () => {
    renderWithStore(null);
    expect(screen.getByText("You’re not logged in")).toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    renderWithStore("token");
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});
