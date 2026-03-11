import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { createTopic, listTopics } from "../lib/api.js";
import TopicForm from "../components/TopicForm.jsx";

export default function Topics() {
  const token = useSelector((state) => state.auth.token);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadTopics() {
    try {
      setError("");
      setTopics(await listTopics(token));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreate(name) {
    try {
      setLoading(true);
      setError("");
      await createTopic(name, token);
      await loadTopics();
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
        <h2 className="text-2xl font-semibold">Topics</h2>
        <p className="text-white/70">Create and manage room topics.</p>
      </div>
      <TopicForm onCreate={handleCreate} loading={loading} />
      {error ? <p className="text-red-400">{error}</p> : null}
      <div className="grid gap-2">
        {topics.map((topic) => (
          <div key={topic.id} className="bg-white/5 border border-white/10 rounded px-3 py-2">
            {topic.name}
          </div>
        ))}
      </div>
    </section>
  );
}
