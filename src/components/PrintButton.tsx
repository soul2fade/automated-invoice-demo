export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print text-sm text-brand-blue hover:text-brand-navy underline"
    >
      Print invoice
    </button>
  );
}
