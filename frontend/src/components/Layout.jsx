import { useDispatch, useSelector } from "react-redux";
import { clearToken, selectCurrentUser, selectIsAuthed } from "../store/authSlice.js";

export default function Layout({ children }) {
  const dispatch = useDispatch();
  const isAuthed = useSelector(selectIsAuthed);
  const user = useSelector(selectCurrentUser);

  function handleLogout() {
    dispatch(clearToken());
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <a className="text-xl font-semibold tracking-tight" href="/">CircleUp</a>
            <span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200 md:inline-block">
              Sprint 4
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <nav className="flex flex-wrap items-center gap-4 text-sm text-white/70">
              <a className="hover:text-white" href="/">Home</a>
              <a className="hover:text-white" href="/topics">Topics</a>
              <a className="hover:text-white" href="/rooms">Rooms</a>
              <a className="hover:text-white" href="/rooms/create">Create Room</a>
              <a className="hover:text-white" href="/rooms/join">Join Invite</a>
              {!isAuthed ? <a className="hover:text-white" href="/signup">Sign up</a> : null}
              {!isAuthed ? <a className="hover:text-white" href="/verify">Verify OTP</a> : null}
            </nav>

            {isAuthed ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-emerald-300">{user?.email || "Signed in"}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded border border-white/15 px-3 py-1.5 text-white/80 hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm">
                <a className="text-white/70 hover:text-white" href="/login">Login</a>
                <a className="rounded bg-emerald-500 px-3 py-1.5 font-medium text-black" href="/signup">Get started</a>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="px-6 py-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
