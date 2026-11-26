import { useState } from 'react';
import { CheckCircle2, AlertCircle, Mail, ArrowRight } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    state: 'idle' | 'success' | 'error';
    text: string;
  }>({ state: 'idle', text: '' });

  const validateEmail = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Please enter your email address to subscribe.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      return 'Please enter a valid email address (e.g. name@domain.com).';
    }
    return undefined;
  };

  const handleChange = (value: string) => {
    setEmail(value);
    if (touched) {
      setError(validateEmail(value));
    }
    if (status.state !== 'idle') {
      setStatus({ state: 'idle', text: '' });
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateEmail(email));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);
    const validationError = validateEmail(email);
    setError(validationError);

    if (validationError) {
      setStatus({
        state: 'error',
        text: validationError,
      });
      return;
    }

    setSubmitting(true);
    setStatus({ state: 'idle', text: '' });

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setStatus({
          state: 'error',
          text: 'Newsletter dispatch requires the live studio server. You can reach us at 01webflow@gmail.com for direct updates.',
        });
        return;
      }

      const data = await response.json();
      if (!response.ok || !data.ok) {
        setStatus({
          state: 'error',
          text: data.error || 'Unable to complete subscription. Please try again.',
        });
        return;
      }

      setStatus({
        state: 'success',
        text: data.message,
      });
      setEmail('');
      setTouched(false);
      setError(undefined);
    } catch {
      // Fallback confirmation when email format passed client-side validation
      setStatus({
        state: 'error',
        text: 'Could not reach the studio server right now. Please try again shortly.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldStateClass = touched ? (error ? 'is-invalid' : 'is-valid') : '';

  return (
    <section
      id="newsletter"
      aria-label="Studio Newsletter Subscription"
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 relative"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="studio-panel rounded-2xl p-7 sm:p-10 lg:p-12 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#397BFF]/70 to-[#8555FF]/70"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono-tabular tracking-wider text-[#397BFF]">
                <Mail className="w-3.5 h-3.5" />
                <span>Studio Dispatch</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F5F7FF] text-balance">
                Stay Updated on New Concepts &amp; AI Design Notes
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-[#A2A9C3] leading-relaxed">
                Occasional updates when fresh case studies, interactive web concepts, or creative direction notes are published. No spam.
              </p>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <form noValidate onSubmit={handleSubmit} className="space-y-3">
                <label
                  htmlFor="newsletter-email"
                  className="block text-xs font-medium text-slate-700 dark:text-[#A2A9C3]"
                >
                  Email address
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 min-w-0">
                    <input
                      id="newsletter-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => handleChange(e.target.value)}
                      onBlur={handleBlur}
                      aria-invalid={Boolean(touched && error)}
                      className={`wf-field w-full px-4 py-3.5 rounded-xl text-sm min-h-[48px] ${fieldStateClass}`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#397BFF] to-[#8555FF] hover:opacity-95 disabled:opacity-60 text-sm font-semibold text-white transition-opacity whitespace-nowrap min-h-[48px] shrink-0"
                  >
                    <span>{submitting ? 'Subscribing...' : 'Subscribe'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {touched && error && (
                  <p className="wf-field-error" role="alert">
                    {error}
                  </p>
                )}
              </form>

              <div
                data-hh-form-msg=""
                data-state={status.state === 'idle' ? undefined : status.state}
                role="status"
                aria-live="polite"
                className={status.state === 'idle' ? 'hidden' : 'block'}
              >
                <div className="flex items-start gap-2.5 text-sm">
                  {status.state === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <span>{status.text}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
