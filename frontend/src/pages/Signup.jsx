import AuthCard from "../components/AuthCard.jsx";
import SignupForm from "../components/SignupForm.jsx";

export default function Signup() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
      <div className="max-w-xl">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">Create account</p>
        <h2 className="mt-3 text-3xl font-semibold">Request an OTP to start using CircleUp.</h2>
        <p className="mt-3 text-white/70">
          Enter your email to receive a one-time code. After that, move to the Verify OTP page to activate the account and set your password.
        </p>
      </div>
      <AuthCard title="Sign up" subtitle="Step 1 of 2: request the OTP for your email.">
        <SignupForm />
      </AuthCard>
    </section>
  );
}
