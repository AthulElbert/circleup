import { useState } from "react";

export default function InviteJoinForm({ onJoin, loading }) {
  const [code, setCode] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!code.trim()) return;
    onJoin(code.trim());
  }

  return (
    <form onSubmit={submit} className="grid gap-3 max-w-md">
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="INV-XXXXXX"
        className="px-3 py-2 rounded bg-white/10 border border-white/10"
      />
      <button disabled={loading} className="px-3 py-2 rounded bg-emerald-500 text-black font-medium">
        {loading ? "Joining..." : "Join Room"}
      </button>
    </form>
  );
}
