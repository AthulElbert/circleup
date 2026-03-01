import { useState } from "react";

export default function RoomCreateForm({ topics, onCreate, loading }) {
  const [title, setTitle] = useState("");
  const [topicId, setTopicId] = useState("");
  const [visibility, setVisibility] = useState("public");

  function submit(e) {
    e.preventDefault();
    if (!title.trim() || !topicId) return;
    onCreate({ title: title.trim(), topicId, visibility });
  }

  return (
    <form onSubmit={submit} className="grid gap-3 max-w-lg">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Room title"
        className="px-3 py-2 rounded bg-white/10 border border-white/10"
      />
      <select
        value={topicId}
        onChange={(e) => setTopicId(e.target.value)}
        className="px-3 py-2 rounded bg-white/10 border border-white/10"
      >
        <option value="">Select topic</option>
        {topics.map((topic) => (
          <option key={topic.id} value={topic.id}>{topic.name}</option>
        ))}
      </select>
      <select
        value={visibility}
        onChange={(e) => setVisibility(e.target.value)}
        className="px-3 py-2 rounded bg-white/10 border border-white/10"
      >
        <option value="public">Public</option>
        <option value="private">Private</option>
      </select>
      <button disabled={loading} className="px-3 py-2 rounded bg-emerald-500 text-black font-medium">
        {loading ? "Creating..." : "Create Room"}
      </button>
    </form>
  );
}
