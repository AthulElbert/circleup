import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { buildRoomSocketUrl, getRoom, listTopics } from "../lib/api.js";
import {
  canManageRole,
  canModerateParticipant,
  deriveCallState,
  mergeParticipantEvent,
  participantRoleLabel,
  statusTone
} from "../lib/liveRoom.js";
import {
  addIceCandidateOrQueue,
  buildRtcConfig,
  flushPendingIceCandidates,
  getUserMediaStream,
  listMediaDevices,
  replacePeerTracks
} from "../lib/webrtc.js";

const RTC_CONFIG = buildRtcConfig(import.meta.env);
const MAX_RECONNECT_ATTEMPTS = 5;

function RemoteVideo({ participant, stream }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream || null;
    }
  }, [stream]);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="aspect-video w-full rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 object-cover"
      />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{participant.email}</p>
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                {participantRoleLabel(participant)}
              </span>
          </div>
          <p className="text-xs text-white/50">Joined {new Date(participant.joinedAt).toLocaleTimeString()}</p>
        </div>
        <div className="text-right text-xs text-white/60">
          <p>{participant.micOn ? "Mic on" : "Mic muted"}</p>
          <p>{participant.camOn ? "Camera on" : "Camera off"}</p>
          {participant.muted ? <p className="text-amber-300">Muted by host</p> : null}
        </div>
      </div>
    </div>
  );
}

export default function RoomLive() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const currentUser = useSelector((state) => state.auth.user);
  const socketRef = useRef(null);
  const peersRef = useRef(new Map());
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const manualDisconnectRef = useRef(false);
  const currentUserRef = useRef(null);
  const mediaStateRef = useRef({ micOn: true, camOn: true });
  const participantsRef = useRef([]);
  const remoteStreamsRef = useRef({});
  const selectedAudioDeviceRef = useRef("");
  const selectedVideoDeviceRef = useRef("");
  const pendingIceRef = useRef(new Map());

  const [room, setRoom] = useState(null);
  const [topicName, setTopicName] = useState("");
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [chatDraft, setChatDraft] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState("");
  const [mediaReady, setMediaReady] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [callState, setCallState] = useState("Waiting for participants");
  const [reconnectCount, setReconnectCount] = useState(0);
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("");
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("");
  const [moderationNotice, setModerationNotice] = useState("");
  const [moderationError, setModerationError] = useState("");
  const [kicked, setKicked] = useState(false);
  const [activePanel, setActivePanel] = useState("participants");

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    mediaStateRef.current = { micOn, camOn };
  }, [micOn, camOn]);

  useEffect(() => {
    selectedAudioDeviceRef.current = selectedAudioDevice;
  }, [selectedAudioDevice]);

  useEffect(() => {
    selectedVideoDeviceRef.current = selectedVideoDevice;
  }, [selectedVideoDevice]);

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    remoteStreamsRef.current = remoteStreams;
  }, [remoteStreams]);

  useEffect(() => {
    async function loadRoom() {
      try {
        const [roomData, topics] = await Promise.all([
          getRoom(roomId, token),
          listTopics(token)
        ]);
        setRoom(roomData);
        const topic = topics.find((item) => item.id === roomData.topicId);
        setTopicName(topic?.name || roomData.topicId);
      } catch (err) {
        setError(err.message);
      }
    }

    loadRoom();
  }, [roomId, token]);

  useEffect(() => {
    let cancelled = false;

    async function prepareMedia() {
      try {
        const devices = await listMediaDevices();
        if (!cancelled) {
          setAudioDevices(devices.audioInputs);
          setVideoDevices(devices.videoInputs);
          setSelectedAudioDevice((current) => current || devices.audioInputs[0]?.deviceId || "");
          setSelectedVideoDevice((current) => current || devices.videoInputs[0]?.deviceId || "");
        }

        const stream = await getUserMediaStream({
          audioDeviceId: selectedAudioDeviceRef.current,
          videoDeviceId: selectedVideoDeviceRef.current
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        localStreamRef.current = stream;
        setMediaError("");
        setMediaReady(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch {
        setMediaReady(true);
        setMediaError("Camera or microphone access was denied. Realtime signaling still works, but media tracks are unavailable.");
      }
    }

    prepareMedia();

    return () => {
      cancelled = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mediaReady) return;
    if (!selectedAudioDevice && !selectedVideoDevice) return;

    let cancelled = false;

    async function switchDevices() {
      try {
        const nextStream = await getUserMediaStream({
          audioDeviceId: selectedAudioDevice,
          videoDeviceId: selectedVideoDevice
        });
        if (cancelled) {
          nextStream.getTracks().forEach((track) => track.stop());
          return;
        }

        const previous = localStreamRef.current;
        localStreamRef.current = nextStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = nextStream;
        }
        nextStream.getAudioTracks().forEach((track) => {
          track.enabled = mediaStateRef.current.micOn;
        });
        nextStream.getVideoTracks().forEach((track) => {
          track.enabled = mediaStateRef.current.camOn;
        });
        await replacePeerTracks(peersRef.current, nextStream);
        previous?.getTracks().forEach((track) => track.stop());
        setMediaError("");
      } catch {
        setMediaError("Unable to switch to the selected camera or microphone.");
      }
    }

    switchDevices();

    return () => {
      cancelled = true;
    };
  }, [selectedAudioDevice, selectedVideoDevice, mediaReady]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current || null;
    }
  }, [mediaReady]);

  useEffect(() => {
    if (!token || !mediaReady || !currentUser?.email || kicked) return undefined;

    manualDisconnectRef.current = false;

    function updateCallState(nextParticipants, nextStatus = status) {
      const selfParticipant = nextParticipants.find((participant) => participant.email === currentUserRef.current?.email);
      setCallState(
        deriveCallState({
          status: nextStatus,
          participants: nextParticipants,
          remoteStreams: remoteStreamsRef.current,
          currentUserEmail: currentUserRef.current?.email,
          reconnectCount: reconnectAttemptRef.current,
          maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
          kicked,
          muted: Boolean(selfParticipant?.muted)
        })
      );
    }

    async function handleRealtimeMessage(event) {
      const payload = JSON.parse(event.data);

      if (payload.type === "snapshot" && payload.snapshot) {
        setParticipants(payload.snapshot.participants || []);
        setMessages(payload.snapshot.messages || []);
        updateCallState(payload.snapshot.participants || []);
        return;
      }

      if ((payload.type === "presence" || payload.type === "media" || payload.type === "moderation") && payload.participant) {
        if (payload.type === "moderation" && payload.action === "kicked" && payload.participant.email === currentUserRef.current?.email) {
          setModerationNotice(payload.error || "You were removed from this room by the host.");
          setKicked(true);
          setStatus("disconnected");
          return;
        }

        setParticipants((current) => {
          const next = mergeParticipantEvent(current, payload, currentUserRef.current?.email);
          const selfParticipant = next.find((participant) => participant.email === currentUserRef.current?.email);
          if (payload.type === "moderation" && payload.action === "muted" && payload.participant.email === currentUserRef.current?.email) {
            setModerationNotice("The host muted your microphone. You can still keep your camera on and use chat.");
            setMicOn(false);
            localStreamRef.current?.getAudioTracks().forEach((track) => {
              track.enabled = false;
            });
          }
          updateCallState(next);
          if (selfParticipant?.muted) {
            setMicOn(false);
          }
          return next;
        });

        if (payload.type === "presence" && payload.action === "joined" && payload.participant.email !== currentUserRef.current?.email) {
          await ensurePeerConnection(payload.participant.email, true);
        }

        if (payload.type === "presence" && payload.action === "left") {
          cleanupPeer(payload.participant.email);
        }
        return;
      }

      if (payload.type === "chat" && payload.message) {
        setMessages((current) => [...current, payload.message]);
        return;
      }

      if (payload.type === "signal" && payload.signal) {
        await handleSignal(payload.signal);
        return;
      }

      if (payload.type === "error") {
        setModerationError(payload.error || "Realtime error");
      }
    }

    function cleanupSocketOnly() {
      if (socketRef.current) {
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onerror = null;
        socketRef.current.onclose = null;
      }
      socketRef.current = null;
    }

    function scheduleReconnect() {
      if (manualDisconnectRef.current || kicked) return;
      if (reconnectAttemptRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setStatus("disconnected");
        setCallState("Disconnected from room");
        setError("Realtime connection was lost and automatic reconnect attempts were exhausted.");
        return;
      }

      reconnectAttemptRef.current += 1;
      setReconnectCount(reconnectAttemptRef.current);
      setStatus("reconnecting");
      setCallState(
        deriveCallState({
          status: "reconnecting",
          participants: participantsRef.current,
          remoteStreams: remoteStreamsRef.current,
          currentUserEmail: currentUserRef.current?.email,
          reconnectCount: reconnectAttemptRef.current,
          maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
          kicked,
          muted: Boolean(participantsRef.current.find((participant) => participant.email === currentUserRef.current?.email)?.muted)
        })
      );
      reconnectTimerRef.current = setTimeout(() => {
        connectSocket();
      }, Math.min(1000 * reconnectAttemptRef.current, 4000));
    }

    function connectSocket() {
      if (manualDisconnectRef.current || kicked) return;

      const socket = new WebSocket(buildRoomSocketUrl(roomId, token));
      socketRef.current = socket;
      setStatus(reconnectAttemptRef.current > 0 ? "reconnecting" : "connecting");
      setCallState(
        deriveCallState({
          status: reconnectAttemptRef.current > 0 ? "reconnecting" : "connecting",
          participants: participantsRef.current,
          remoteStreams: remoteStreamsRef.current,
          currentUserEmail: currentUserRef.current?.email,
          reconnectCount: reconnectAttemptRef.current,
          maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
          kicked,
          muted: Boolean(participantsRef.current.find((participant) => participant.email === currentUserRef.current?.email)?.muted)
        })
      );

      socket.onopen = () => {
        reconnectAttemptRef.current = 0;
        setReconnectCount(0);
        setStatus("connected");
        setError("");
        setModerationError("");
        setCallState(
          deriveCallState({
            status: "connected",
            participants: participantsRef.current,
            remoteStreams: remoteStreamsRef.current,
            currentUserEmail: currentUserRef.current?.email,
            reconnectCount: 0,
            maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
            kicked,
            muted: Boolean(participantsRef.current.find((participant) => participant.email === currentUserRef.current?.email)?.muted)
          })
        );
        socket.send(JSON.stringify({ type: "media", ...mediaStateRef.current }));
      };

      socket.onmessage = handleRealtimeMessage;

      socket.onerror = () => {
        setError("Realtime connection failed. Check that all laptops are using the same backend host.");
      };

      socket.onclose = () => {
        cleanupSocketOnly();
        peersRef.current.forEach((peer, email) => {
          peer.close();
          peersRef.current.delete(email);
        });
        setRemoteStreams({});
        setParticipants((current) =>
          current.filter((participant) => participant.email === currentUserRef.current?.email)
        );
        scheduleReconnect();
      };
    }

    connectSocket();

    return () => {
      manualDisconnectRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      socketRef.current?.close();
      peersRef.current.forEach((peer) => peer.close());
      peersRef.current.clear();
      setRemoteStreams({});
    };
  }, [roomId, token, mediaReady, currentUser?.email, kicked]);

  useEffect(() => {
    const selfParticipant = participants.find((participant) => participant.email === currentUser?.email);
    setCallState(
      deriveCallState({
        status,
        participants,
        remoteStreams,
        currentUserEmail: currentUser?.email,
        reconnectCount,
        maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
        kicked,
        muted: Boolean(selfParticipant?.muted)
      })
    );
  }, [participants, remoteStreams, status, currentUser, reconnectCount, kicked]);

  const currentParticipant = useMemo(
    () => participants.find((participant) => participant.email === currentUser?.email),
    [participants, currentUser]
  );
  const remoteParticipants = useMemo(
    () => participants.filter((participant) => participant.email !== currentUser?.email),
    [participants, currentUser]
  );
  const isHost = currentParticipant?.role === "host";
  const isCoHost = currentParticipant?.role === "co-host";

  function sendSocketMessage(message) {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }

  function setRemoteStream(email, stream) {
    setRemoteStreams((current) => ({ ...current, [email]: stream }));
  }

  function cleanupPeer(email) {
    const peer = peersRef.current.get(email);
    if (peer) {
      peer.close();
      peersRef.current.delete(email);
    }
    pendingIceRef.current.delete(email);
    setRemoteStreams((current) => {
      const next = { ...current };
      delete next[email];
      return next;
    });
  }

  function createPeer(email) {
    const peer = new RTCPeerConnection(RTC_CONFIG);

    localStreamRef.current?.getTracks().forEach((track) => {
      peer.addTrack(track, localStreamRef.current);
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        sendSocketMessage({
          type: "signal",
          toEmail: email,
          kind: "ice",
          payload: event.candidate
        });
      }
    };

    peer.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        setRemoteStream(email, stream);
      }
    };

    peer.onconnectionstatechange = () => {
      if (["failed", "closed", "disconnected"].includes(peer.connectionState)) {
        cleanupPeer(email);
      }
    };

    peersRef.current.set(email, peer);
    return peer;
  }

  async function ensurePeerConnection(email, initiator = false) {
    if (!email || email === currentUserRef.current?.email) return null;

    let peer = peersRef.current.get(email);
    if (!peer) {
      peer = createPeer(email);
    }

    if (initiator) {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      sendSocketMessage({
        type: "signal",
        toEmail: email,
        kind: "offer",
        payload: offer
      });
    }

    return peer;
  }

  async function handleSignal(signal) {
    if (!signal?.fromEmail || signal.fromEmail === currentUserRef.current?.email) return;

    const peer = await ensurePeerConnection(signal.fromEmail, false);
    if (!peer) return;

    if (signal.kind === "offer") {
      await peer.setRemoteDescription(new RTCSessionDescription(signal.payload));
      const pending = pendingIceRef.current.get(signal.fromEmail) || [];
      await flushPendingIceCandidates(peer, pending);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      sendSocketMessage({
        type: "signal",
        toEmail: signal.fromEmail,
        kind: "answer",
        payload: answer
      });
      return;
    }

    if (signal.kind === "answer") {
      await peer.setRemoteDescription(new RTCSessionDescription(signal.payload));
      const pending = pendingIceRef.current.get(signal.fromEmail) || [];
      await flushPendingIceCandidates(peer, pending);
      return;
    }

    if (signal.kind === "ice") {
      const pending = pendingIceRef.current.get(signal.fromEmail) || [];
      pendingIceRef.current.set(signal.fromEmail, pending);
      await addIceCandidateOrQueue(peer, signal, pending);
    }
  }

  function sendMedia(nextMicOn, nextCamOn) {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = nextMicOn;
    });
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = nextCamOn;
    });
    sendSocketMessage({ type: "media", micOn: nextMicOn, camOn: nextCamOn });
  }

  function handleToggleMic() {
    if (currentParticipant?.muted) {
      setModerationNotice("You are currently muted by the host.");
      return;
    }
    const next = !micOn;
    setMicOn(next);
    sendMedia(next, camOn);
  }

  function handleToggleCam() {
    const next = !camOn;
    setCamOn(next);
    sendMedia(micOn, next);
  }

  function handleModeration(action, email) {
    setModerationError("");
    setModerationNotice("");
    sendSocketMessage({ type: "moderation", action, toEmail: email });
  }

  function handleSendMessage(event) {
    event.preventDefault();
    const body = chatDraft.trim();
    if (!body || socketRef.current?.readyState !== WebSocket.OPEN) return;
    sendSocketMessage({ type: "chat", body });
    setChatDraft("");
  }

  useEffect(() => {
    if (!kicked) return;
    const timer = setTimeout(() => {
      navigate(`/rooms/${roomId}`);
    }, 1800);
    return () => clearTimeout(timer);
  }, [kicked, navigate, roomId]);

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <div className="grid gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40 sm:text-sm">Live room</p>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{room?.title || roomId}</h2>
              <p className="mt-2 text-sm text-white/70 sm:text-base">Topic: {topicName || "Loading..."}</p>
              <p className={`mt-2 text-sm ${statusTone(status)}`}>Connection: {status}</p>
              <p className="mt-1 text-sm text-white/60">{callState}</p>
              {isHost ? <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-amber-200">Host controls enabled</p> : null}
              {isCoHost ? <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-sky-200">Co-host moderation enabled</p> : null}
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
              <button
                type="button"
                onClick={handleToggleMic}
                disabled={currentParticipant?.muted}
                className={`rounded-xl px-4 py-3 text-sm font-medium ${micOn ? "bg-emerald-500 text-black" : "border border-white/15 text-white/80"} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {currentParticipant?.muted ? "Muted by host" : micOn ? "Mic on" : "Mic off"}
              </button>
              <button
                type="button"
                onClick={handleToggleCam}
                className={`rounded-xl px-4 py-3 text-sm font-medium ${camOn ? "bg-sky-400 text-black" : "border border-white/15 text-white/80"}`}
              >
                {camOn ? "Camera on" : "Camera off"}
              </button>
            </div>
          </div>
        </div>

        <div className="xl:hidden rounded-2xl border border-white/10 bg-white/[0.03] p-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActivePanel("participants")}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${activePanel === "participants" ? "bg-white text-slate-950" : "text-white/70"}`}
            >
              Participants ({participants.length})
            </button>
            <button
              type="button"
              onClick={() => setActivePanel("chat")}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${activePanel === "chat" ? "bg-white text-slate-950" : "text-white/70"}`}
            >
              Chat ({messages.length})
            </button>
          </div>
        </div>

        {status === "reconnecting" ? (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            Reconnect attempt {reconnectCount} of {MAX_RECONNECT_ATTEMPTS}. Remote streams will re-negotiate when the socket is back.
          </div>
        ) : null}

        {moderationNotice ? <p className="text-sm text-amber-200">{moderationNotice}</p> : null}
        {mediaError ? <p className="text-sm text-amber-300">{mediaError}</p> : null}
        {moderationError ? <p className="text-sm text-red-300">{moderationError}</p> : null}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {kicked ? <p className="text-sm font-medium text-red-200">You were removed from this room by the host. Redirecting back to room details.</p> : null}

        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="text-white/70">Microphone</span>
            <select
              value={selectedAudioDevice}
              onChange={(event) => setSelectedAudioDevice(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white"
            >
              <option value="">Default microphone</option>
              {audioDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId}`}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-white/70">Camera</span>
            <select
              value={selectedVideoDevice}
              onChange={(event) => setSelectedVideoDevice(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white"
            >
              <option value="">Default camera</option>
              {videoDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId}`}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-2 text-xs leading-6 text-white/50">
            STUN/TURN servers are read from <code>VITE_STUN_SERVER_URLS</code>, <code>VITE_TURN_SERVER_URLS</code>, <code>VITE_TURN_USERNAME</code>, and <code>VITE_TURN_CREDENTIAL</code>.
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-4 sm:p-5">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="aspect-video w-full rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 object-cover"
            />
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">You</p>
                  {currentParticipant ? (
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                      {participantRoleLabel(currentParticipant)}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-white/50">Local preview</p>
              </div>
              <div className="text-right text-xs text-white/60">
                <p>{micOn ? "Mic on" : "Mic muted"}</p>
                <p>{camOn ? "Camera on" : "Camera off"}</p>
                {currentParticipant?.muted ? <p className="text-amber-300">Muted by host</p> : null}
              </div>
            </div>
          </div>

          {remoteParticipants.map((participant) => (
            <RemoteVideo
              key={participant.email}
              participant={participant}
              stream={remoteStreams[participant.email]}
            />
          ))}
        </div>
      </div>

      <aside className="grid gap-6 xl:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className={`${activePanel === "participants" ? "block" : "hidden"} xl:block rounded-2xl border border-white/10 bg-white/5 p-5`}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Participants</h3>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/60">{participants.length} online</span>
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            {participants.map((participant) => (
              <div key={participant.email} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{participant.email}</p>
                      <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                        {participantRoleLabel(participant)}
                      </span>
                    </div>
                    <p className="text-white/60">
                      {participant.email === currentUser?.email ? "This device" : "Remote participant"}
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      {participant.micOn ? "Mic on" : "Mic muted"} · {participant.camOn ? "Camera on" : "Camera off"}
                    </p>
                    {participant.muted ? <p className="mt-1 text-xs text-amber-300">Muted by host</p> : null}
                  </div>
                  {canModerateParticipant(currentParticipant, participant) || canManageRole(currentParticipant, participant) ? (
                    <div className="grid gap-2 text-xs sm:min-w-[10rem]">
                      {canManageRole(currentParticipant, participant) ? (
                        participant.role === "co-host" ? (
                          <button
                            type="button"
                            onClick={() => handleModeration("demote", participant.email)}
                            className="rounded-xl border border-white/20 px-3 py-2 font-medium text-white/80"
                          >
                            Remove co-host
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleModeration("promote", participant.email)}
                            className="rounded-xl border border-sky-400/30 px-3 py-2 font-medium text-sky-200"
                          >
                            Make co-host
                          </button>
                        )
                      ) : null}
                      {canModerateParticipant(currentParticipant, participant) ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleModeration(participant.muted ? "unmute" : "mute", participant.email)}
                            className="rounded-xl border border-amber-400/30 px-3 py-2 font-medium text-amber-200"
                          >
                            {participant.muted ? "Unmute" : "Mute"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleModeration("kick", participant.email)}
                            className="rounded-xl border border-red-400/30 px-3 py-2 font-medium text-red-200"
                          >
                            Remove
                          </button>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {!participants.length ? <p className="text-white/60">No one is connected yet.</p> : null}
          </div>
        </div>

        <div className={`${activePanel === "chat" ? "block" : "hidden"} xl:block rounded-2xl border border-white/10 bg-white/5 p-5`}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Room chat</h3>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/60">{messages.length} messages</span>
          </div>
          <div className="mt-4 grid max-h-[320px] gap-3 overflow-y-auto pr-1 text-sm sm:max-h-[360px]">
            {messages.map((message) => (
              <div key={message.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between gap-3 text-xs text-white/50">
                  <span>{message.senderEmail}</span>
                  <span>{new Date(message.sentAt).toLocaleTimeString()}</span>
                </div>
                <p className="mt-2 text-white/85">{message.body}</p>
              </div>
            ))}
            {!messages.length ? <p className="text-white/60">No messages yet.</p> : null}
          </div>
          <form onSubmit={handleSendMessage} className="mt-4 grid gap-3">
            <textarea
              value={chatDraft}
              onChange={(event) => setChatDraft(event.target.value)}
              rows={3}
              placeholder="Type a message to everyone in this room"
              className="rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-medium text-black disabled:opacity-60"
              disabled={status !== "connected"}
            >
              Send message
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/60">
          <p className="font-medium text-white/80">Multi-laptop test note</p>
          <p className="mt-2 leading-6">
            Start frontend with <code>--host 0.0.0.0</code> and point both laptops to the same host IP.
            Set <code>VITE_API_BASE_URL</code> and <code>VITE_WS_BASE_URL</code> to that host.
          </p>
          {currentParticipant ? (
            <p className="mt-2 text-emerald-300">
              Your broadcast state: {currentParticipant.micOn ? "mic on" : "mic off"}, {currentParticipant.camOn ? "camera on" : "camera off"}
            </p>
          ) : null}
        </div>
      </aside>
    </section>
  );
}

