import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getRoom, listTopics } from "../lib/api.js";

export default function RoomDetails() {
  const { roomId } = useParams();
  const token = useSelector((state) => state.auth.token);
  const [room, setRoom] = useState(null);
  const [topicName, setTopicName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRoomDetails() {
      try {
        setError("");
        const [roomData, topics] = await Promise.all([
          getRoom(roomId, token),
          listTopics(token)
        ]);
        setRoom(roomData);
        const topic = topics.find((item) => item.id === roomData.topicId);
        setTopicName(topic?.name || roomData.topicId);
      } catch (err) {
        setError(err.message);
      }
    }

    loadRoomDetails();
  }, [roomId, token]);

  if (error) {
    return (
      <section className="grid gap-4">
        <h2 className="text-2xl font-semibold">Room Details</h2>
        <p className="text-red-400">{error}</p>
      </section>
    );
  }

  if (!room) {
    return (
      <section className="grid gap-4">
        <h2 className="text-2xl font-semibold">Room Details</h2>
        <p className="text-white/60">Loading room details...</p>
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      <div>
        <h2 className="text-2xl font-semibold">{room.title}</h2>
        <p className="text-white/70">Detailed view for this circle.</p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div>
          <p className="text-sm text-white/50">Room ID</p>
          <p className="font-medium">{room.id}</p>
        </div>
        <div>
          <p className="text-sm text-white/50">Topic</p>
          <p className="font-medium">{topicName}</p>
        </div>
        <div>
          <p className="text-sm text-white/50">Visibility</p>
          <p className="font-medium capitalize">{room.visibility}</p>
        </div>
        <div>
          <p className="text-sm text-white/50">Owner</p>
          <p className="font-medium">{room.ownerEmail}</p>
        </div>
        {room.inviteCode ? (
          <div>
            <p className="text-sm text-white/50">Invite Code</p>
            <p className="font-medium text-emerald-300">{room.inviteCode}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
