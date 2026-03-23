import { describe, expect, it } from "vitest";
import { isEmail } from "./validators.js";

describe("isEmail", () => {
  it("returns true for a valid email", () => {
    expect(isEmail("test@circleup.com")).toBe(true);
  });

  it("returns false for an invalid email", () => {
    expect(isEmail("not-an-email")).toBe(false);
  });
});
