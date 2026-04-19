export default function Home() {
  return (
    <section className="grid gap-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.25),_transparent_35%),linear-gradient(135deg,_rgba(15,23,42,1)_0%,_rgba(2,6,23,1)_55%,_rgba(15,23,42,1)_100%)] p-8 shadow-2xl shadow-black/30 md:p-12">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.18),_transparent_55%)] lg:block" />
        <div className="relative grid gap-10 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">CircleUp</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
              Join focused live circles without the usual meeting clutter.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/70 md:text-lg">
              CircleUp helps teams, study groups, and communities create topic-based rooms,
              invite the right people, and switch straight into a live collaborative session.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded bg-emerald-500 px-5 py-3 text-sm font-medium text-black" href="/signup">
                Sign up and request OTP
              </a>
              <a className="rounded border border-white/20 px-5 py-3 text-sm font-medium text-white/85" href="/verify">
                Verify OTP
              </a>
              <a className="rounded border border-sky-400/30 px-5 py-3 text-sm font-medium text-sky-200" href="/login">
                Login
              </a>
            </div>
          </div>

          <div className="grid gap-4 rounded-3xl border border-white/10 bg-black/20 p-6 backdrop-blur">
            <div>
              <p className="text-sm text-white/50">What you can do now</p>
              <ul className="mt-4 grid gap-3 text-sm text-white/80">
                <li>Create topic-based rooms</li>
                <li>Generate private invite codes</li>
                <li>Join live rooms with realtime presence</li>
                <li>Use room chat, media toggles, and WebRTC signaling</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/70">
              Sprint 4 starts with UX polish: stronger landing page, explicit auth entry points,
              and final product quality improvements.
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm text-white/50">Step 1</p>
          <h3 className="mt-2 text-lg font-semibold">Create your account</h3>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Request an OTP, verify it, and log in with a real backend-issued JWT.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm text-white/50">Step 2</p>
          <h3 className="mt-2 text-lg font-semibold">Open a circle</h3>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Create public or private rooms, assign a topic, and invite the right participants.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm text-white/50">Step 3</p>
          <h3 className="mt-2 text-lg font-semibold">Go live</h3>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Join the live room, see who is present, chat in real time, and negotiate media connections.
          </p>
        </div>
      </div>
    </section>
  );
}
