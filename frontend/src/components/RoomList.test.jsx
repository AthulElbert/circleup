import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoomList from "./RoomList.jsx";

describe("RoomList", () => {
  it("shows empty state when there are no rooms", () => {
    render(
      <RoomList
        rooms={[]}
        topicNames={{}}
        onGenerateInvite={() => {}}
        generatingRoomId=""
        actionError={null}
      />
    );

    expect(screen.getByText(/No rooms created yet/i)).toBeInTheDocument();
  });

  it("renders room actions and only shows invite generation for private rooms", async () => {
    const user = userEvent.setup();
    const onGenerateInvite = vi.fn();

    render(
      <RoomList
        rooms={[
          { id: "room_public", title: "Daily Standup", topicId: "topic_1", visibility: "public", ownerEmail: "host@circleup.com" },
          { id: "room_private", title: "Interview Prep", topicId: "topic_2", visibility: "private", ownerEmail: "host@circleup.com", inviteCode: "INV-123" }
        ]}
        topicNames={{ topic_1: "Frontend", topic_2: "System Design" }}
        onGenerateInvite={onGenerateInvite}
        generatingRoomId=""
        actionError={null}
      />
    );

    expect(screen.getByText("Topic: Frontend")).toBeInTheDocument();
    expect(screen.getByText("Invite: INV-123")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Join live room" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "View details" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Generate Invite" })).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Generate Invite" }));
    expect(onGenerateInvite).toHaveBeenCalledWith("room_private");
  });
});
