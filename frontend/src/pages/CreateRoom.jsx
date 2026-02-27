import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { createRoom, listTopics } from "../lib/api.js";
import RoomCreateForm from "../components/RoomCreateForm.jsx";

export default function CreateRoom() {
  const token = useSelector((state) => state.auth.token);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadTopics() {
    try {
      setTopics(await listTopics(token));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreate(payload) {
    try {
      setLoading(true);
      setError("");
      const room = await createRoom(payload, token);
      setMessage(`Room created: ${room.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      <RoomCreateForm topics={topics} onCreate={handleCreate} loading={loading} />
      {message ? <p className="text-emerald-300">{message}</p> : null}
      {error ? <p className="text-red-400">{error}</p> : null}
    </section>
  );
}
