import { describe, expect, it } from "vitest";
import {
  canManageRole,
  canModerateParticipant,
  deriveCallState,
  mergeParticipantEvent,
  participantRoleLabel,
  statusTone
} from "./liveRoom.js";

describe("liveRoom helpers", () => {
  it("returns the correct tone for connection states", () => {
    expect(statusTone("connected")).toBe("text-emerald-300");
    expect(statusTone("connecting")).toBe("text-amber-300");
    expect(statusTone("reconnecting")).toBe("text-amber-300");
    expect(statusTone("disconnected")).toBe("text-red-300");
  });

  it("derives waiting and live call states", () => {
    expect(deriveCallState({ status: "connected", participants: [{ email: "alice@circleup.com" }], remoteStreams: {}, currentUserEmail: "alice@circleup.com", reconnectCount: 0, maxReconnectAttempts: 5, kicked: false, muted: false })).toBe("Waiting for another participant");
    expect(deriveCallState({ status: "connected", participants: [{ email: "alice@circleup.com" }, { email: "bob@circleup.com" }], remoteStreams: {}, currentUserEmail: "alice@circleup.com", reconnectCount: 0, maxReconnectAttempts: 5, kicked: false, muted: false })).toBe("Negotiating media connection");
    expect(deriveCallState({ status: "connected", participants: [{ email: "alice@circleup.com" }, { email: "bob@circleup.com" }], remoteStreams: { "bob@circleup.com": {} }, currentUserEmail: "alice@circleup.com", reconnectCount: 0, maxReconnectAttempts: 5, kicked: false, muted: false })).toBe("Live call active");
  });

  it("derives muted and kicked states", () => {
    expect(deriveCallState({ status: "connected", participants: [{ email: "alice@circleup.com" }, { email: "bob@circleup.com" }], remoteStreams: { "bob@circleup.com": {} }, currentUserEmail: "alice@circleup.com", reconnectCount: 0, maxReconnectAttempts: 5, kicked: false, muted: true })).toBe("Live call active (host muted your microphone)");
    expect(deriveCallState({ status: "disconnected", participants: [], remoteStreams: {}, currentUserEmail: "alice@circleup.com", reconnectCount: 5, maxReconnectAttempts: 5, kicked: true, muted: false })).toBe("Removed from room by host");
  });

  it("merges participant join, moderation, and leave events", () => {
    const base = [{ email: "alice@circleup.com", role: "host" }];
    const joined = mergeParticipantEvent(base, { type: "presence", action: "joined", participant: { email: "bob@circleup.com", micOn: true, camOn: true, muted: false, role: "participant" } }, "alice@circleup.com");
    const promoted = mergeParticipantEvent(joined, { type: "moderation", action: "promoted", participant: { email: "bob@circleup.com", micOn: true, camOn: true, muted: false, role: "co-host" } }, "alice@circleup.com");
    expect(promoted[1].role).toBe("co-host");
    const left = mergeParticipantEvent(promoted, { type: "presence", action: "left", participant: { email: "bob@circleup.com" } }, "alice@circleup.com");
    expect(left.map((participant) => participant.email)).toEqual(["alice@circleup.com"]);
  });

  it("exposes role labels and moderation permissions", () => {
    const host = { email: "host@circleup.com", role: "host" };
    const cohost = { email: "cohost@circleup.com", role: "co-host" };
    const guest = { email: "guest@circleup.com", role: "participant" };
    expect(participantRoleLabel(host)).toBe("Host");
    expect(participantRoleLabel(cohost)).toBe("Co-host");
    expect(canModerateParticipant(host, cohost)).toBe(true);
    expect(canModerateParticipant(cohost, guest)).toBe(true);
    expect(canModerateParticipant(cohost, host)).toBe(false);
    expect(canManageRole(host, guest)).toBe(true);
    expect(canManageRole(cohost, guest)).toBe(false);
  });
});
