import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { createRoom, listTopics } from "../lib/api.js";
import RoomCreateForm from "../components/RoomCreateForm.jsx";

export default function CreateRoom() {
  const token = useSelector((state) => state.auth.token);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadTopics() {
    try {
      setLoading(true);
      setError("");
      setTopics(await listTopics(token));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(payload) {
    try {
      setSubmitting(true);
      setError("");
      const room = await createRoom(payload, token);
      setMessage(`Room created: ${room.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadTopics();
  }, []);

  return (
    <section className="grid gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Create Room</h2>
        <p className="text-white/70">Create public or private rooms linked to a topic.</p>
      </div>
      {loading ? <p className="text-white/60">Loading topics...</p> : null}
      {!loading && !topics.length ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-white/60">
          No topics available. Create a topic first before creating a room.
        </div>
      ) : null}
      {!loading && topics.length ? (
        <RoomCreateForm topics={topics} onCreate={handleCreate} loading={submitting} />
      ) : null}
      {message ? <p className="text-emerald-300">{message}</p> : null}
      {error ? <p className="text-red-400">{error}</p> : null}
    </section>
  );
}
