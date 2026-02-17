import SignupForm from "../components/SignupForm.jsx";

export default function Signup() {
  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-semibold">Create account</h2>
      <div className="mt-6">
        <SignupForm />
      </div>
    </div>
  );
}
