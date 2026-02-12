export default function Home() {
  return (
    <section className="grid gap-6 md:grid-cols-2 items-center">
      <div>
        <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
          A calmer way to meet and talk in focused circles.
        </h2>
        <p className="mt-3 text-white/70">
          CircleUp Sprint 1 scaffold. Explore the auth flow and base layout.
        </p>
        <div className="mt-6 flex gap-3">
          <a className="px-4 py-2 rounded bg-emerald-500 text-black" href="/signup">Get started</a>
          <a className="px-4 py-2 rounded border border-white/20" href="/login">Sign in</a>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-sm text-white/60">Sprint 1 scope</div>
        <ul className="mt-3 grid gap-2 text-white/80">
          <li>OTP signup and login</li>
          <li>Auth scaffolding + protected route</li>
          <li>Clean UI foundation for future sprints</li>
        </ul>
      </div>
    </section>
  );
}
