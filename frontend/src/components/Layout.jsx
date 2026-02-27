export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="px-6 py-4 border-b border-white/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">CircleUp</h1>
          <nav className="flex items-center gap-4 text-sm text-white/70">
            <a className="hover:text-white" href="/">Home</a>
            <a className="hover:text-white" href="/topics">Topics</a>
            <a className="hover:text-white" href="/rooms">Rooms</a>
            <a className="hover:text-white" href="/rooms/create">Create Room</a>
            <a className="hover:text-white" href="/rooms/join">Join Invite</a>
            <a className="hover:text-white" href="/login">Login</a>
          </nav>
        </div>
      </header>
      <main className="px-6 py-12">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
