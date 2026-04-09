export function splitServerList(value) {
  return (value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function buildRtcConfig(env = {}) {
  const stunUrls = splitServerList(env.VITE_STUN_SERVER_URLS || "stun:stun.l.google.com:19302");
  const turnUrls = splitServerList(env.VITE_TURN_SERVER_URLS || "");
  const iceServers = [];

  if (stunUrls.length) {
    iceServers.push({ urls: stunUrls });
  }

  if (turnUrls.length) {
    iceServers.push({
      urls: turnUrls,
      username: env.VITE_TURN_USERNAME || "",
      credential: env.VITE_TURN_CREDENTIAL || ""
    });
  }

  return { iceServers };
}

export async function listMediaDevices(mediaDevices = navigator.mediaDevices) {
  if (!mediaDevices?.enumerateDevices) {
    return { audioInputs: [], videoInputs: [] };
  }

  const devices = await mediaDevices.enumerateDevices();
  return {
    audioInputs: devices.filter((device) => device.kind === "audioinput"),
    videoInputs: devices.filter((device) => device.kind === "videoinput")
  };
}

export async function getUserMediaStream({ audioDeviceId, videoDeviceId, mediaDevices = navigator.mediaDevices }) {
  const constraints = {
    audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
    video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true
  };
  return mediaDevices.getUserMedia(constraints);
}

export async function replacePeerTracks(peers, stream) {
  const tasks = [];

  peers.forEach((peer) => {
    const senders = peer.getSenders ? peer.getSenders() : [];
    const audioTrack = stream.getAudioTracks?.()[0] || null;
    const videoTrack = stream.getVideoTracks?.()[0] || null;

    senders.forEach((sender) => {
      if (sender.track?.kind === "audio") {
        tasks.push(sender.replaceTrack(audioTrack));
      }
      if (sender.track?.kind === "video") {
        tasks.push(sender.replaceTrack(videoTrack));
      }
    });
    if (!senders.length && peer.addTrack) {
      stream.getTracks?.().forEach((track) => peer.addTrack(track, stream));
    }
  });

  await Promise.all(tasks);
}

export async function addIceCandidateOrQueue(peer, signal, pendingCandidates, RTCIceCandidateCtor = RTCIceCandidate) {
  if (!peer || !signal?.payload) return;

  if (!peer.remoteDescription) {
    pendingCandidates.push(signal.payload);
    return;
  }

  await peer.addIceCandidate(new RTCIceCandidateCtor(signal.payload));
}

export async function flushPendingIceCandidates(peer, pendingCandidates, RTCIceCandidateCtor = RTCIceCandidate) {
  while (pendingCandidates.length) {
    const candidate = pendingCandidates.shift();
    await peer.addIceCandidate(new RTCIceCandidateCtor(candidate));
  }
}
