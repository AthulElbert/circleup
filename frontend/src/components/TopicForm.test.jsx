import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TopicForm from "./TopicForm.jsx";

describe("TopicForm", () => {
  it("submits trimmed topic names", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(<TopicForm onCreate={onCreate} loading={false} />);

    await user.type(screen.getByPlaceholderText("Topic name"), "  System Design  ");
    await user.click(screen.getByRole("button", { name: "Create Topic" }));

    expect(onCreate).toHaveBeenCalledWith("System Design");
  });
});
