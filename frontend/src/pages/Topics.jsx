import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { createTopic, listTopics } from "../lib/api.js";
import TopicForm from "../components/TopicForm.jsx";

export default function Topics() {
  const token = useSelector((state) => state.auth.token);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  async function handleCreate(name) {
    try {
      setSubmitting(true);
      setError("");
      await createTopic(name, token);
      await loadTopics();
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
        <h2 className="text-2xl font-semibold">Topics</h2>
        <p className="text-white/70">Create and manage room topics.</p>
      </div>
      <TopicForm onCreate={handleCreate} loading={submitting} />
      {error ? <p className="text-red-400">{error}</p> : null}
      {loading ? <p className="text-white/60">Loading topics...</p> : null}
      {!loading && !topics.length ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-white/60">
          No topics yet. Create one to organize your first room.
        </div>
      ) : null}
      {!loading && topics.length ? (
        <div className="grid gap-2">
          {topics.map((topic) => (
            <div key={topic.id} className="bg-white/5 border border-white/10 rounded px-3 py-2">
              {topic.name}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
