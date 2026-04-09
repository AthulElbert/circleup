export default function RoomList({
  rooms,
  topicNames,
  onGenerateInvite,
  generatingRoomId,
  actionError
}) {
  if (!rooms.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-white/60">
        No rooms created yet. Create one to start inviting people.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {rooms.map((room) => (
        <div key={room.id} className="border border-white/10 rounded p-4 bg-white/5">
          <h3 className="font-semibold">{room.title}</h3>
          <p className="text-sm text-white/70">Topic: {topicNames[room.topicId] || room.topicId}</p>
          <p className="text-sm text-white/70">Visibility: {room.visibility}</p>
          {room.inviteCode ? <p className="text-sm text-emerald-300">Invite: {room.inviteCode}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <a
              href={`/rooms/${room.id}`}
              className="inline-block text-sm text-sky-300 hover:text-sky-200"
            >
              View details
            </a>
            <a
              href={`/rooms/${room.id}/live`}
              className="inline-block text-sm text-amber-300 hover:text-amber-200"
            >
              Join live room
            </a>
            {room.visibility === "private" ? (
              <button
                type="button"
                onClick={() => onGenerateInvite(room.id)}
                disabled={generatingRoomId === room.id}
                className="px-3 py-2 rounded bg-emerald-500 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingRoomId === room.id ? "Generating..." : "Generate Invite"}
              </button>
            ) : null}
          </div>
          {actionError?.roomId === room.id ? (
            <p className="mt-2 text-sm text-red-400">{actionError.message}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
