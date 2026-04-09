const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const WS_BASE = import.meta.env.VITE_WS_BASE_URL || API_BASE.replace(/^http/, "ws");

export async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return res.json();
}

export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function buildRoomSocketUrl(roomId, token) {
  return `${WS_BASE}/ws/rooms/${roomId}?token=${encodeURIComponent(token)}`;
}

export function listTopics(token) {
  return apiRequest("/topics/", { headers: authHeaders(token) });
}

export function createTopic(name, token) {
  return apiRequest("/topics/", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ name })
  });
}

export function createRoom(payload, token) {
  return apiRequest("/rooms/", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export function listRooms(token) {
  return apiRequest("/rooms/", { headers: authHeaders(token) });
}

export function getRoom(roomId, token) {
  return apiRequest(`/rooms/${roomId}`, { headers: authHeaders(token) });
}

export function generateInvite(roomId, token) {
  return apiRequest("/invites/generate", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ roomId })
  });
}

export function joinInvite(code, token) {
  return apiRequest("/invites/join", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ code })
  });
}
