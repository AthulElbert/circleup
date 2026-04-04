import { describe, expect, it } from "vitest";
import { deriveCallState, mergeParticipantEvent, statusTone } from "./liveRoom.js";

describe("liveRoom helpers", () => {
  it("returns the correct tone for connection states", () => {
    expect(statusTone("connected")).toBe("text-emerald-300");
    expect(statusTone("connecting")).toBe("text-amber-300");
    expect(statusTone("reconnecting")).toBe("text-amber-300");
    expect(statusTone("disconnected")).toBe("text-red-300");
  });

  it("derives waiting and live call states", () => {
    expect(
      deriveCallState({
        status: "connected",
        participants: [{ email: "alice@circleup.com" }],
        remoteStreams: {},
        currentUserEmail: "alice@circleup.com",
        reconnectCount: 0,
        maxReconnectAttempts: 5
      })
    ).toBe("Waiting for another participant");

    expect(
      deriveCallState({
        status: "connected",
        participants: [
          { email: "alice@circleup.com" },
          { email: "bob@circleup.com" }
        ],
        remoteStreams: {},
        currentUserEmail: "alice@circleup.com",
        reconnectCount: 0,
        maxReconnectAttempts: 5
      })
    ).toBe("Negotiating media connection");

    expect(
      deriveCallState({
        status: "connected",
        participants: [
          { email: "alice@circleup.com" },
          { email: "bob@circleup.com" }
        ],
        remoteStreams: { "bob@circleup.com": {} },
        currentUserEmail: "alice@circleup.com",
        reconnectCount: 0,
        maxReconnectAttempts: 5
      })
    ).toBe("Live call active");
  });

  it("derives reconnecting and disconnected states", () => {
    expect(
      deriveCallState({
        status: "reconnecting",
        participants: [],
        remoteStreams: {},
        currentUserEmail: "alice@circleup.com",
        reconnectCount: 2,
        maxReconnectAttempts: 5
      })
    ).toBe("Reconnecting to room (2/5)");

    expect(
      deriveCallState({
        status: "disconnected",
        participants: [],
        remoteStreams: {},
        currentUserEmail: "alice@circleup.com",
        reconnectCount: 5,
        maxReconnectAttempts: 5
      })
    ).toBe("Disconnected from room");
  });

  it("merges participant join and leave events", () => {
    const base = [{ email: "alice@circleup.com" }];

    const joined = mergeParticipantEvent(
      base,
      {
        type: "presence",
        action: "joined",
        participant: { email: "bob@circleup.com", micOn: true, camOn: true }
      },
      "alice@circleup.com"
    );
    expect(joined.map((participant) => participant.email)).toEqual([
      "alice@circleup.com",
      "bob@circleup.com"
    ]);

    const left = mergeParticipantEvent(
      joined,
      {
        type: "presence",
        action: "left",
        participant: { email: "bob@circleup.com" }
      },
      "alice@circleup.com"
    );
    expect(left.map((participant) => participant.email)).toEqual([
      "alice@circleup.com"
    ]);
  });
});
