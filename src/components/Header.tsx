export function Header() {
  return (
    <header className="bg-white border-b border-slate-200 no-print">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
        <img src="/logo.png" alt="The Automated COO" className="h-8 w-8" />
        <div>
          <div className="font-semibold text-brand-navy">The Automated COO</div>
          <div className="text-xs text-slate-500">AI invoice generator for trades · Sacramento, CA</div>
        </div>
      </div>
    </header>
  );
}
