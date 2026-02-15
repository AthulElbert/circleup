import { useSelector } from "react-redux";
import { selectIsAuthed } from "../store/authSlice.js";

export default function AuthGate({ children }) {
  const isAuthed = useSelector(selectIsAuthed);

  if (!isAuthed) {
    return (
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
        <h3 className="text-lg font-semibold">You’re not logged in</h3>
        <p className="mt-1 text-sm text-white/60">Please log in to continue.</p>
        <div className="mt-4 flex gap-3 text-sm">
          <a
            className="px-3 py-2 rounded bg-emerald-500 text-black font-medium"
            href="/login"
          >
            Go to Login
          </a>
          <a
            className="px-3 py-2 rounded border border-white/15 hover:bg-white/5"
            href="/signup"
          >
            Create account
          </a>
        </div>
      </div>
    );
  }

  return children;
}
