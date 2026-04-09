export default function Home() {
  return (
    <section className="grid gap-6 items-center md:grid-cols-2">
      <div>
        <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
          Sprint 3: Live rooms, presence, and chat
        </h2>
        <p className="mt-3 text-white/70">
          CircleUp now supports shared live rooms over a single backend host so multiple
          laptops can join the same room, see presence, and exchange chat in real time.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a className="rounded bg-emerald-500 px-4 py-2 text-black" href="/rooms">Browse Rooms</a>
          <a className="rounded border border-white/20 px-4 py-2" href="/rooms/create">Create Room</a>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-sm text-white/60">Sprint 3 Scope</div>
        <ul className="mt-3 grid gap-2 text-white/80">
          <li>Realtime room presence over WebSocket</li>
          <li>Room chat shared across connected participants</li>
          <li>Mic and camera toggle state broadcast</li>
          <li>LAN-friendly host configuration for multi-laptop demos</li>
        </ul>
      </div>
    </section>
  );
}
