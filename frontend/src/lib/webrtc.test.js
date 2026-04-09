import { describe, expect, it, vi } from "vitest";
import {
  addIceCandidateOrQueue,
  buildRtcConfig,
  flushPendingIceCandidates,
  listMediaDevices,
  replacePeerTracks,
  splitServerList
} from "./webrtc.js";

describe("webrtc helpers", () => {
  it("splits comma-separated server lists", () => {
    expect(splitServerList("stun:a, stun:b ,, turn:c")).toEqual(["stun:a", "stun:b", "turn:c"]);
  });

  it("builds rtc config from env vars", () => {
    const config = buildRtcConfig({
      VITE_STUN_SERVER_URLS: "stun:one,stun:two",
      VITE_TURN_SERVER_URLS: "turn:relay.example.com:3478",
      VITE_TURN_USERNAME: "user",
      VITE_TURN_CREDENTIAL: "pass"
    });

    expect(config.iceServers).toEqual([
      { urls: ["stun:one", "stun:two"] },
      {
        urls: ["turn:relay.example.com:3478"],
        username: "user",
        credential: "pass"
      }
    ]);
  });

  it("lists audio and video devices separately", async () => {
    const devices = await listMediaDevices({
      enumerateDevices: vi.fn().mockResolvedValue([
        { kind: "audioinput", deviceId: "audio-1", label: "Mic" },
        { kind: "videoinput", deviceId: "video-1", label: "Cam" },
        { kind: "audiooutput", deviceId: "speaker-1", label: "Speaker" }
      ])
    });

    expect(devices.audioInputs).toHaveLength(1);
    expect(devices.videoInputs).toHaveLength(1);
  });

  it("queues ICE candidates until remote description exists", async () => {
    const pending = [];
    const peer = {
      remoteDescription: null,
      addIceCandidate: vi.fn()
    };

    await addIceCandidateOrQueue(peer, { payload: { candidate: "ice-1" } }, pending, class {
      constructor(value) {
        this.value = value;
      }
    });

    expect(pending).toEqual([{ candidate: "ice-1" }]);
    expect(peer.addIceCandidate).not.toHaveBeenCalled();
  });

  it("flushes queued ICE candidates after remote description exists", async () => {
    const added = [];
    const peer = {
      addIceCandidate: vi.fn(async (candidate) => {
        added.push(candidate.value);
      })
    };
    const pending = [{ candidate: "ice-1" }, { candidate: "ice-2" }];

    await flushPendingIceCandidates(peer, pending, class {
      constructor(value) {
        this.value = value;
      }
    });

    expect(added).toEqual([{ candidate: "ice-1" }, { candidate: "ice-2" }]);
    expect(pending).toEqual([]);
  });

  it("replaces tracks across peer senders", async () => {
    const replaceAudio = vi.fn();
    const replaceVideo = vi.fn();
    const stream = {
      getAudioTracks: () => [{ kind: "audio", id: "audio-1" }],
      getVideoTracks: () => [{ kind: "video", id: "video-1" }]
    };

    const peers = new Map([
      ["peer-1", {
        getSenders: () => [
          { track: { kind: "audio" }, replaceTrack: replaceAudio },
          { track: { kind: "video" }, replaceTrack: replaceVideo }
        ]
      }]
    ]);

    await replacePeerTracks(peers, stream);

    expect(replaceAudio).toHaveBeenCalled();
    expect(replaceVideo).toHaveBeenCalled();
  });
});
