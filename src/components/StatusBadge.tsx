import type { InvoiceStatus } from '../types';

interface Props {
  status: InvoiceStatus;
  dueDate: string;
}

const STYLES: Record<InvoiceStatus, string> = {
  unpaid: 'bg-slate-100 text-slate-700',
  paid: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-rose-100 text-rose-700',
};

const LABELS: Record<InvoiceStatus, string> = {
  unpaid: 'UNPAID',
  paid: 'PAID',
  overdue: 'OVERDUE',
};

export function StatusBadge({ status, dueDate: _dueDate }: Props) {
  return (
    <span
      data-status={status}
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${STYLES[status]}`}
    >
      {status === 'paid' && (
        <svg
          aria-label="paid"
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {LABELS[status]}
    </span>
  );
}
