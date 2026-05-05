import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { TradeToggle } from './components/TradeToggle';
import { JobInput } from './components/JobInput';
import { InvoiceDocument } from './components/InvoiceDocument';
import { PrintButton } from './components/PrintButton';
import { CtaBanner } from './components/CtaBanner';
import { Toast } from './components/Toast';
import { cannedInvoices } from './data/canned-invoices';
import type { Invoice, Quote, Trade } from './types';
import { streamInvoice } from './lib/streaming';
import { decodeQuoteFromFragment } from './lib/encoding';
import { quoteToInvoice } from './lib/quoteToInvoice';

type AppMode = 'cold' | 'delta';

export default function App() {
  const [mode, setMode] = useState<AppMode>('cold');
  const [trade, setTrade] = useState<Trade>('hvac');
  const [invoice, setInvoice] = useState<Partial<Invoice>>(cannedInvoices.hvac);
  const [sourceQuote, setSourceQuote] = useState<Quote | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // On mount: check for deep-link payload in the URL fragment
  useEffect(() => {
    const decoded = decodeQuoteFromFragment(window.location.hash);
    if (decoded) {
      setMode('delta');
      setTrade(decoded.trade);
      setSourceQuote(decoded);
      setInvoice(quoteToInvoice(decoded));
    } else if (window.location.hash.includes('q=')) {
      // hash had a q= param but didn't validate
      setToast("Couldn't read the quote — showing a fresh invoice instead.");
    }
  }, []);

  const switchTrade = (t: Trade) => {
    abortController?.abort();
    setAbortController(null);
    setIsGenerating(false);
    setTrade(t);
    setInvoice(cannedInvoices[t]);
  };

  const startFresh = () => {
    abortController?.abort();
    setAbortController(null);
    window.location.hash = '';
    setMode('cold');
    setSourceQuote(null);
    setIsGenerating(false);
    setTrade('hvac');
    setInvoice(cannedInvoices.hvac);
  };

  const generate = async (text: string) => {
    abortController?.abort();
    const ctrl = new AbortController();
    setAbortController(ctrl);
    setIsGenerating(true);

    // Reset visible body of invoice while keeping header/contractor
    setInvoice((prev) => ({
      ...prev,
      lineItems: [],
      summary: '',
      subtotal: undefined,
      tax: undefined,
      total: undefined,
    }));

    const req = mode === 'cold'
      ? { mode: 'cold' as const, trade, description: text }
      : { mode: 'delta' as const, trade, sourceQuote: sourceQuote!, changes: text };

    try {
      let lastPartial: { error?: string; summary?: string; lineItems?: unknown } | null = null;
      for await (const partial of streamInvoice(req, ctrl.signal)) {
        lastPartial = partial;
        if (partial.error && !partial.summary && !partial.lineItems) continue;
        setInvoice((prev) => ({
          ...prev,
          ...partial,
          contractor: prev.contractor,
        }));
      }
      if (lastPartial?.error) throw new Error(lastPartial.error);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      console.error(err);
      setToast("Couldn't generate live — showing the sample instead. Try again?");
      setInvoice(mode === 'cold' ? cannedInvoices[trade] : (sourceQuote ? quoteToInvoice(sourceQuote) : cannedInvoices[trade]));
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  const heroHeadline = mode === 'cold' ? 'AI invoice generator for trades' : 'Your invoice';
  const heroSub = mode === 'cold'
    ? 'Type what you finished — get a customer-ready invoice.'
    : 'Edit and re-generate if anything changed.';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="text-center no-print">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-navy">{heroHeadline}</h1>
          <p className="text-slate-600 mt-2">{heroSub}</p>
        </div>

        {mode === 'cold' && (
          <div className="flex justify-center no-print">
            <TradeToggle selected={trade} onChange={switchTrade} />
          </div>
        )}

        <JobInput trade={trade} mode={mode} onGenerate={generate} isGenerating={isGenerating} />

        {mode === 'cold' && (
          <p className="text-center text-xs text-slate-500 no-print">
            Have a quote already?{' '}
            <a href="https://quotedemo.netlify.app" className="underline">Generate it on the quote tool</a>
            , then click "Convert to invoice".
          </p>
        )}

        {mode === 'delta' && (
          <div className="text-center no-print">
            <button
              type="button"
              onClick={startFresh}
              className="text-xs text-slate-500 underline hover:text-slate-700"
            >
              Start fresh →
            </button>
          </div>
        )}

        <div className="flex justify-end max-w-4xl mx-auto px-2 no-print">
          <PrintButton />
        </div>

        <InvoiceDocument invoice={invoice} />

        <CtaBanner />

        <footer className="no-print text-center text-xs text-slate-400 py-6">
          Generated by <a href="https://quotedemo.netlify.app" className="underline">The Automated COO</a>
        </footer>
      </main>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
