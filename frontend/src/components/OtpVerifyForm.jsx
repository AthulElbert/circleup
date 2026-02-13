import { isEmail } from "../lib/validators.js";

export default function OtpVerifyForm() {
  function handleSubmit(e) {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const otp = e.target.otp.value.trim();
    const password = e.target.password.value;
    if (!isEmail(email)) return alert("Invalid email");
    if (!otp) return alert("OTP required");
    if (!password) return alert("Password required");
    alert("OTP verified (mock)");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm">
        <span className="text-white/70">Email</span>
        <input
          name="email"
          className="px-3 py-2 rounded bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
          placeholder="you@circleup.com"
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="text-white/70">OTP code</span>
        <input
          name="otp"
          className="px-3 py-2 rounded bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
          placeholder="123456"
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="text-white/70">Password</span>
        <input
          name="password"
          type="password"
          className="px-3 py-2 rounded bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
          placeholder="Create a password"
        />
      </label>
      <button className="mt-2 px-3 py-2 rounded bg-emerald-500 text-black font-medium">Verify</button>
      <p className="text-xs text-white/50">Use the code from your email to activate the account.</p>
    </form>
  );
}
