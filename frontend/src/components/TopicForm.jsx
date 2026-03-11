import { useState } from "react";

export default function TopicForm({ onCreate, loading }) {
  const [name, setName] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
    setName("");
  }

  return (
    <form onSubmit={submit} className="grid gap-3 max-w-md">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Topic name"
        className="px-3 py-2 rounded bg-white/10 border border-white/10"
      />
      <button disabled={loading} className="px-3 py-2 rounded bg-emerald-500 text-black font-medium">
        {loading ? "Creating..." : "Create Topic"}
      </button>
    </form>
  );
}
