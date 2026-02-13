export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 shadow-xl shadow-black/20">
      <div className="px-6 py-5 border-b border-white/10">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-white/60">{subtitle}</p> : null}
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}
