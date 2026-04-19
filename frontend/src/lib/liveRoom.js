export function statusTone(status) {
  if (status === "connected") return "text-emerald-300";
  if (status === "connecting" || status === "reconnecting") return "text-amber-300";
  return "text-red-300";
}

export function deriveCallState({ status, participants, remoteStreams, currentUserEmail, reconnectCount, maxReconnectAttempts, kicked, muted }) {
  const remoteParticipants = participants.filter(
    (participant) => participant.email !== currentUserEmail
  );

  if (kicked) return "Removed from room by host";
  if (status === "connecting") return "Connecting to room";
  if (status === "reconnecting") return `Reconnecting to room (${reconnectCount}/${maxReconnectAttempts})`;
  if (status === "disconnected") return "Disconnected from room";
  if (!remoteParticipants.length) return muted ? "Waiting for another participant while muted" : "Waiting for another participant";
  if (Object.keys(remoteStreams).length < remoteParticipants.length) return muted ? "Negotiating media connection while muted" : "Negotiating media connection";
  return muted ? "Live call active (host muted your microphone)" : "Live call active";
}

export function mergeParticipantEvent(participants, payload, currentUserEmail) {
  if (!payload?.participant) return participants;
  const next = participants.filter((participant) => participant.email !== payload.participant.email);
  if (payload.type === "presence" && payload.action === "left") {
    return next;
  }
  return [...next, payload.participant].sort((a, b) => {
    if (a.email === currentUserEmail) return -1;
    if (b.email === currentUserEmail) return 1;
    if (roleRank(a.role) !== roleRank(b.role)) return roleRank(a.role) - roleRank(b.role);
    return a.email.localeCompare(b.email);
  });
}

function roleRank(role) {
  if (role === "host") return 0;
  if (role === "co-host") return 1;
  return 2;
}

export function participantRoleLabel(participant) {
  if (!participant) return "Participant";
  if (participant.role === "host") return "Host";
  if (participant.role === "co-host") return "Co-host";
  return "Participant";
}

export function canModerateParticipant(actor, participant) {
  if (!actor?.email || !participant?.email || actor.email === participant.email) return false;
  if (actor.role === "host") return participant.role !== "host";
  if (actor.role === "co-host") return participant.role === "participant";
  return false;
}

export function canManageRole(actor, participant) {
  return actor?.role === "host" && participant?.role !== "host" && actor.email !== participant.email;
}
