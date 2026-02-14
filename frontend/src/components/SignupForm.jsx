import { useState } from "react";
import { isEmail } from "../lib/validators.js";
import { apiRequest } from "../lib/api.js";

export default function SignupForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const email = e.target.email.value.trim();

    if (!isEmail(email)) return setError("Invalid email address");

    try {
      setLoading(true);
      setError("");

      await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email })
      });

      alert("OTP requested (mock)");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm">
        <span className="text-white/70">Email</span>
        <input
          name="email"
          type="email"
          className="px-3 py-2 rounded bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
          placeholder="you@circleup.com"
        />
      </label>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        disabled={loading}
        className="mt-2 px-3 py-2 rounded bg-emerald-500 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Requesting..." : "Request OTP"}
      </button>

      <p className="text-xs text-white/50">
        We’ll send a 6-digit code to this email.
      </p>
    </form>
  );
}
