import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { joinInvite, listTopics } from "../lib/api.js";
import InviteJoinForm from "../components/InviteJoinForm.jsx";

export default function JoinInvite() {
  const token = useSelector((state) => state.auth.token);
  const [room, setRoom] = useState(null);
  const [topicNames, setTopicNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTopics() {
      try {
        const topics = await listTopics(token);
        setTopicNames(
          topics.reduce((acc, topic) => {
            acc[topic.id] = topic.name;
            return acc;
          }, {})
        );
      } catch {
        // Topic lookup is auxiliary here; join flow should still work.
      }
    }

    loadTopics();
  }, [token]);

  async function handleJoin(code) {
    try {
      setLoading(true);
      setError("");
      setRoom(await joinInvite(code, token));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Join By Invite</h2>
        <p className="text-white/70">Use an invite code to join a private room.</p>
      </div>
      <InviteJoinForm onJoin={handleJoin} loading={loading} />
      {error ? <p className="text-red-400">{error}</p> : null}
      {!room && !error ? <p className="text-white/60">Enter a code to load room details.</p> : null}
      {room ? (
        <div className="bg-white/5 border border-white/10 rounded p-4">
          <p className="font-semibold">Joined: {room.title}</p>
          <p className="text-sm text-white/70">Room ID: {room.id}</p>
          <p className="text-sm text-white/70">Topic: {topicNames[room.topicId] || room.topicId}</p>
          <p className="text-sm text-white/70">Visibility: {room.visibility}</p>
        </div>
      ) : null}
    </section>
  );
}
