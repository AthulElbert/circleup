export default function Home() {
  return (
    <section className="grid gap-6 md:grid-cols-2 items-center">
      <div>
        <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
          Sprint 2: Topics, Rooms, and Invite Join
        </h2>
        <p className="mt-3 text-white/70">
          Create topics, create public or private rooms, and join private rooms with invite codes.
        </p>
        <div className="mt-6 flex gap-3">
          <a className="px-4 py-2 rounded bg-emerald-500 text-black" href="/topics">Manage Topics</a>
          <a className="px-4 py-2 rounded border border-white/20" href="/rooms">Browse Rooms</a>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-sm text-white/60">Sprint 2 Scope</div>
        <ul className="mt-3 grid gap-2 text-white/80">
          <li>Topics: create and list</li>
          <li>Rooms: create and list</li>
          <li>Private room invite join flow</li>
        </ul>
      </div>
    </section>
  );
}
