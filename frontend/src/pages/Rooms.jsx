import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { generateInvite, listRooms, listTopics } from "../lib/api.js";
import RoomList from "../components/RoomList.jsx";

export default function Rooms() {
  const token = useSelector((state) => state.auth.token);
  const [rooms, setRooms] = useState([]);
  const [topicNames, setTopicNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingRoomId, setGeneratingRoomId] = useState("");
  const [actionError, setActionError] = useState(null);

  async function loadRooms() {
    try {
      setLoading(true);
      setError("");
      const [roomList, topics] = await Promise.all([listRooms(token), listTopics(token)]);
      setRooms(roomList);
      setTopicNames(
        topics.reduce((acc, topic) => {
          acc[topic.id] = topic.name;
          return acc;
        }, {})
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateInvite(roomId) {
    try {
      setGeneratingRoomId(roomId);
      setActionError(null);
      const invite = await generateInvite(roomId, token);
      setRooms((currentRooms) =>
        currentRooms.map((room) =>
          room.id === roomId ? { ...room, inviteCode: invite.code } : room
        )
      );
    } catch (err) {
      setActionError({ roomId, message: err.message });
    } finally {
      setGeneratingRoomId("");
    }
  }

  useEffect(() => {
    loadRooms();
  }, []);

  return (
    <section className="grid gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Rooms</h2>
        <p className="text-white/70">Browse available circles and generate private invite codes.</p>
      </div>
      {error ? <p className="text-red-400">{error}</p> : null}
      {loading ? <p className="text-white/60">Loading rooms...</p> : null}
      {!loading ? (
        <RoomList
          rooms={rooms}
          topicNames={topicNames}
          onGenerateInvite={handleGenerateInvite}
          generatingRoomId={generatingRoomId}
          actionError={actionError}
        />
      ) : null}
    </section>
  );
}
