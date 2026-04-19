import AuthCard from "../components/AuthCard.jsx";
import LoginForm from "../components/LoginForm.jsx";

export default function Login() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
      <div className="max-w-xl">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">Welcome back</p>
        <h2 className="mt-3 text-3xl font-semibold">Log in to continue your circle.</h2>
        <p className="mt-3 text-white/70">
          Use the email and password created during OTP verification. After login you can access topics,
          rooms, and live sessions.
        </p>
      </div>
      <AuthCard title="Login" subtitle="Use your verified CircleUp account credentials.">
        <LoginForm />
      </AuthCard>
    </section>
  );
}
