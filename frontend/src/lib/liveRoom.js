export function statusTone(status) {
  if (status === "connected") return "text-emerald-300";
  if (status === "connecting" || status === "reconnecting") return "text-amber-300";
  return "text-red-300";
}

export function deriveCallState({ status, participants, remoteStreams, currentUserEmail, reconnectCount, maxReconnectAttempts }) {
  const remoteParticipants = participants.filter(
    (participant) => participant.email !== currentUserEmail
  );

  if (status === "connecting") {
    return "Connecting to room";
  }

  if (status === "reconnecting") {
    return `Reconnecting to room (${reconnectCount}/${maxReconnectAttempts})`;
  }

  if (status === "disconnected") {
    return "Disconnected from room";
  }

  if (!remoteParticipants.length) {
    return "Waiting for another participant";
  }

  if (Object.keys(remoteStreams).length < remoteParticipants.length) {
    return "Negotiating media connection";
  }

  return "Live call active";
}

export function mergeParticipantEvent(participants, payload, currentUserEmail) {
  if (!payload?.participant) return participants;

  const next = participants.filter(
    (participant) => participant.email !== payload.participant.email
  );

  if (payload.type === "presence" && payload.action === "left") {
    return next;
  }

  return [...next, payload.participant].sort((a, b) => {
    if (a.email === currentUserEmail) return -1;
    if (b.email === currentUserEmail) return 1;
    return a.email.localeCompare(b.email);
  });
}
