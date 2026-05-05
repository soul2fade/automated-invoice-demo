const BOOKING_URL = 'https://cal.com/benchcoo/20min';

export function CtaBanner() {
  return (
    <section className="no-print bg-brand-navy text-white rounded-2xl px-8 py-10 text-center max-w-3xl mx-auto my-12 shadow-card">
      <h2 className="text-2xl font-semibold mb-2">Want this for your business?</h2>
      <p className="text-slate-200 mb-5">Book a free 20-minute consult and we'll talk about turning your quoting and invoicing (and the rest of your operations) into a system that runs itself.</p>
      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-white text-brand-navy font-semibold px-6 py-3 rounded-lg hover:bg-slate-100 transition-colors"
      >
        Book a 20-min consult →
      </a>
    </section>
  );
}
