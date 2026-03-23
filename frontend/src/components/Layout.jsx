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
      <header className="px-6 py-4 border-b border-white/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-6">
          <h1 className="text-xl font-semibold tracking-tight">CircleUp</h1>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4 text-sm text-white/70">
              <a className="hover:text-white" href="/">Home</a>
              <a className="hover:text-white" href="/topics">Topics</a>
              <a className="hover:text-white" href="/rooms">Rooms</a>
              <a className="hover:text-white" href="/rooms/create">Create Room</a>
              <a className="hover:text-white" href="/rooms/join">Join Invite</a>
            </nav>
            {isAuthed ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-emerald-300">{user?.email || "Signed in"}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded border border-white/15 text-white/80 hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <a className="text-sm text-white/70 hover:text-white" href="/login">Login</a>
            )}
          </div>
        </div>
      </header>
      <main className="px-6 py-12">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
