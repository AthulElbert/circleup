import AuthCard from "../components/AuthCard.jsx";
import OtpVerifyForm from "../components/OtpVerifyForm.jsx";

export default function OtpVerify() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
      <div className="max-w-xl">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">Verify account</p>
        <h2 className="mt-3 text-3xl font-semibold">Activate your account and create your password.</h2>
        <p className="mt-3 text-white/70">
          Use the OTP sent to your email to finish signup. Once verified, return to the Login page and access your rooms.
        </p>
      </div>
      <AuthCard title="Verify OTP" subtitle="Step 2 of 2: confirm the code and set your password.">
        <OtpVerifyForm />
      </AuthCard>
    </section>
  );
}
