import type { Invoice } from '../types';
import { StatusBadge } from './StatusBadge';

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

function daysBetween(later: string, earlier: string): number {
  const ld = new Date(later);
  const ed = new Date(earlier);
  return Math.round((ld.getTime() - ed.getTime()) / (1000 * 60 * 60 * 24));
}

interface Props {
  invoice: Partial<Invoice>;
}

export function InvoiceDocument({ invoice }: Props) {
  const labor = (invoice.lineItems ?? []).filter((li) => li.category === 'labor');
  const materials = (invoice.lineItems ?? []).filter((li) => li.category === 'materials');
  const isPaid = invoice.status === 'paid';
  const isOverdue = invoice.status === 'overdue';
  const daysPastDue = isOverdue && invoice.dueDate ? daysBetween(new Date().toISOString().slice(0, 10), invoice.dueDate) : 0;

  return (
    <article className="invoice-document bg-white rounded-2xl border border-slate-200 shadow-document p-8 md:p-12 max-w-4xl mx-auto font-serif text-slate-900">
      <header className="flex justify-between items-start gap-6 pb-6 border-b border-slate-300">
        {invoice.contractor && (
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">{invoice.contractor.name}</h1>
            <p className="text-sm text-slate-600 mt-1">{invoice.contractor.license}</p>
            <p className="text-sm text-slate-600">{invoice.contractor.address}</p>
            <p className="text-sm text-slate-600">{invoice.contractor.phone} · {invoice.contractor.email}</p>
            <p className="text-sm text-slate-600">{invoice.contractor.website}</p>
          </div>
        )}
        <div className="text-right text-sm">
          <p className="font-semibold text-slate-900">INVOICE</p>
          {invoice.invoiceNumber && <p className="text-slate-600">{invoice.invoiceNumber}</p>}
          {invoice.dateIssued && <p className="text-slate-600">Issued: {fmtDate(invoice.dateIssued)}</p>}
          {invoice.dueDate && <p className="text-slate-600">Due: {fmtDate(invoice.dueDate)}</p>}
          {invoice.status && invoice.dueDate && (
            <p className="mt-2"><StatusBadge status={invoice.status} dueDate={invoice.dueDate} /></p>
          )}
        </div>
      </header>

      {invoice.customer && (
        <section className="py-6 border-b border-slate-200">
          <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-2">Bill to</h2>
          <p className="font-semibold">{invoice.customer.name}</p>
          <p className="text-sm text-slate-600">{invoice.customer.address}</p>
          <p className="text-sm text-slate-600">{invoice.customer.email} · {invoice.customer.phone}</p>
          {invoice.sourceQuoteNumber && (
            <p className="text-xs text-slate-500 mt-2 font-sans">
              Per quote {invoice.sourceQuoteNumber}{invoice.dateIssued ? ` issued ${fmtDate(invoice.dateIssued)}` : ''}
            </p>
          )}
        </section>
      )}

      {invoice.summary && (
        <section className="py-6 border-b border-slate-200">
          <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-2">Job summary</h2>
          <p className="text-base leading-relaxed">{invoice.summary}</p>
        </section>
      )}

      {invoice.lineItems && invoice.lineItems.length > 0 && (
        <section className="py-6 border-b border-slate-200">
          <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-3">Line items</h2>
          <LineItemsTable label="Labor" items={labor} />
          <LineItemsTable label="Materials" items={materials} />
        </section>
      )}

      {isOverdue && (
        <section className="py-3 px-4 bg-rose-50 border-l-4 border-rose-400 text-rose-900 text-sm font-sans">
          This invoice is {daysPastDue} day{daysPastDue === 1 ? '' : 's'} past due.
        </section>
      )}

      {invoice.subtotal !== undefined && (
        <section className="py-4 border-b border-slate-200">
          <div className="flex justify-end">
            <table className="text-sm">
              <tbody>
                <tr><td className="pr-8 py-1 text-slate-600">Subtotal</td><td className="text-right font-medium">{fmtCurrency(invoice.subtotal)}</td></tr>
                {invoice.tax !== undefined && <tr><td className="pr-8 py-1 text-slate-600">Tax (Sacramento County 7.75%, materials only)</td><td className="text-right font-medium">{fmtCurrency(invoice.tax)}</td></tr>}
                {invoice.total !== undefined && <tr className="border-t border-slate-300"><td className="pr-8 pt-2 font-bold text-base">Total</td><td className="pt-2 text-right font-bold text-base">{fmtCurrency(invoice.total)}</td></tr>}
                {isPaid && invoice.total !== undefined && (
                  <>
                    <tr><td className="pr-8 py-1 text-slate-600">Amount Paid</td><td className="text-right font-medium">{fmtCurrency(invoice.total)}</td></tr>
                    <tr><td className="pr-8 py-1 font-semibold">Balance Due</td><td className="text-right font-semibold">{fmtCurrency(0)}</td></tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {invoice.paymentInstructions && (
        <section className="py-6 border-b border-slate-200">
          <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-3">Payment instructions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 rounded-lg p-4 text-sm">
            <div>
              <p className="font-semibold mb-1">Pay by check to:</p>
              <p>{invoice.paymentInstructions.check.payeeName}</p>
              <p className="text-slate-600">{invoice.paymentInstructions.check.address}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Pay by ACH:</p>
              <p>Routing: {invoice.paymentInstructions.ach.routing}</p>
              <p>Account: {invoice.paymentInstructions.ach.account}</p>
              <p>Memo: {invoice.paymentInstructions.ach.memo}</p>
            </div>
          </div>
        </section>
      )}

      {invoice.terms && invoice.terms.length > 0 && (
        <section className="py-6 border-b border-slate-200">
          <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-2">Terms & conditions</h2>
          <ol className="text-sm space-y-1.5 list-decimal list-inside">
            {invoice.terms.map((t, i) => <li key={i}>{t}</li>)}
          </ol>
        </section>
      )}

      <section className="pt-6">
        {isPaid ? (
          <p className="text-center text-base font-semibold text-emerald-700 py-4">Thank you for your business.</p>
        ) : (
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="text-slate-600 mb-8">{invoice.acceptanceLine ?? 'Customer payment / signature'}</p>
              <div className="border-b border-slate-400" />
            </div>
            <div>
              <p className="text-slate-600 mb-8">Date</p>
              <div className="border-b border-slate-400" />
            </div>
          </div>
        )}
        <p className="text-center text-xs text-slate-400 mt-8 font-sans">
          Generated by <a href="https://quotedemo.netlify.app" className="underline">The Automated COO</a> — AI invoice demo
        </p>
      </section>
    </article>
  );
}

function LineItemsTable({ label, items }: { label: string; items: Invoice['lineItems'] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-4">
      <h3 className="text-xs font-sans font-semibold text-slate-700 mb-1.5">{label}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500 font-sans">
            <th className="pb-1 font-medium">Description</th>
            <th className="pb-1 font-medium text-right w-16">Qty</th>
            <th className="pb-1 font-medium text-right w-16">Unit</th>
            <th className="pb-1 font-medium text-right w-24">Rate</th>
            <th className="pb-1 font-medium text-right w-24">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className="border-t border-slate-100">
              <td className="py-1.5">{it.description}</td>
              <td className="py-1.5 text-right">{it.qty}</td>
              <td className="py-1.5 text-right">{it.unit}</td>
              <td className="py-1.5 text-right">{fmtCurrency(it.unitPrice)}</td>
              <td className="py-1.5 text-right font-medium">{fmtCurrency(it.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
