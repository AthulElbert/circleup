import OtpVerifyForm from "../components/OtpVerifyForm.jsx";

export default function OtpVerify() {
  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-semibold">Verify OTP</h2>
      <div className="mt-6">
        <OtpVerifyForm />
      </div>
    </div>
  );
}
