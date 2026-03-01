export default function RoomList({ rooms }) {
  if (!rooms.length) return <p className="text-white/60">No rooms created yet.</p>;

  return (
    <div className="grid gap-3">
      {rooms.map((room) => (
        <div key={room.id} className="border border-white/10 rounded p-4 bg-white/5">
          <h3 className="font-semibold">{room.title}</h3>
          <p className="text-sm text-white/70">Topic: {room.topicId}</p>
          <p className="text-sm text-white/70">Visibility: {room.visibility}</p>
          {room.inviteCode ? <p className="text-sm text-emerald-300">Invite: {room.inviteCode}</p> : null}
        </div>
      ))}
    </div>
  );
}
