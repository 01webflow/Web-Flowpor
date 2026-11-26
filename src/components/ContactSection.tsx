import { useState } from 'react';
import { Mail, Phone, MapPin, Globe, Send, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { STUDIO_CONTACT } from '../data/studioData';

interface FormValues {
  fullName: string;
  email: string;
  service: string;
  budget: string;
  description: string;
  _hh_hp: string;
}

type FieldKey = 'fullName' | 'email' | 'service' | 'budget' | 'description';

const SERVICE_OPTIONS = [
  'AI Website Design',
  'Logo & Brand Identity',
  'AI UGC & Video Content',
  'Digital Creative Design',
  'Other',
];

const BUDGET_PRESETS = ['$300 – $600', '$600 – $1,200', '$1,200 – $2,500', '$2,500+'];

export default function ContactSection() {
  const [values, setValues] = useState<FormValues>({
    fullName: '',
    email: '',
    service: 'AI Website Design',
    budget: '$600 – $1,200',
    description: '',
    _hh_hp: '',
  });

  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    fullName: false,
    email: false,
    service: false,
    budget: false,
    description: false,
  });

  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    state: 'idle' | 'success' | 'error';
    text: string;
    inquiryId?: string;
    mode?: string;
  }>({ state: 'idle', text: '' });

  const validateField = (name: FieldKey, value: string): string | undefined => {
    const trimmed = value.trim();
    switch (name) {
      case 'fullName':
        if (trimmed.length < 2) return 'Please enter your full name (at least 2 characters).';
        return undefined;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
          return 'Please enter a valid email address.';
        }
        return undefined;
      case 'service':
        if (!SERVICE_OPTIONS.includes(trimmed)) return 'Please choose a studio service.';
        return undefined;
      case 'budget':
        if (trimmed.length < 2) return 'Please enter or select an estimated budget.';
        return undefined;
      case 'description':
        if (trimmed.length < 15) {
          return 'Please share at least 15 characters describing your project goals.';
        }
        return undefined;
    }
  };

  const validateAll = (currentValues: FormValues): Partial<Record<FieldKey, string>> => {
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    (['fullName', 'email', 'service', 'budget', 'description'] as FieldKey[]).forEach((key) => {
      const err = validateField(key, currentValues[key]);
      if (err) nextErrors[key] = err;
    });
    return nextErrors;
  };

  const handleChange = (name: FieldKey, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (name: FieldKey) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, values[name]);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const fieldStateClass = (name: FieldKey): string => {
    if (!touched[name]) return '';
    return errors[name] ? 'is-invalid' : 'is-valid';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      service: true,
      budget: true,
      description: true,
    });

    const validationErrors = validateAll(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setStatusMessage({
        state: 'error',
        text: 'Please review the highlighted fields before sending your inquiry.',
      });
      return;
    }

    setSubmitting(true);
    setStatusMessage({ state: 'idle', text: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        if (data.fieldErrors && typeof data.fieldErrors === 'object') {
          setErrors(data.fieldErrors);
        }
        setStatusMessage({
          state: 'error',
          text:
            data.error ||
            `Submission could not be completed. Please email ${STUDIO_CONTACT.email} directly.`,
        });
        return;
      }

      setStatusMessage({
        state: 'success',
        text: data.message,
        inquiryId: data.id,
        mode: data.mode,
      });

      setValues({
        fullName: '',
        email: '',
        service: 'AI Website Design',
        budget: '$600 – $1,200',
        description: '',
        _hh_hp: '',
      });
      setTouched({
        fullName: false,
        email: false,
        service: false,
        budget: false,
        description: false,
      });
      setErrors({});
    } catch {
      setStatusMessage({
        state: 'error',
        text: `Network error reaching the studio server. You can reach us immediately at ${STUDIO_CONTACT.email} or WhatsApp ${STUDIO_CONTACT.phoneDisplay}.`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappDirectLink = `${STUDIO_CONTACT.whatsappUrl}?text=${encodeURIComponent(
    `Hello WebFlow Creative Studio, I would like to discuss a ${values.service} project.`
  )}`;

  return (
    <section id="contact" className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 relative">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Left Column: Direct Studio Channels */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <p className="font-mono-tabular text-xs tracking-wider text-[#397BFF]">
                10 · Start a Conversation
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F5F7FF] text-balance">
                Have an Idea? Let&apos;s Build Something Remarkable.
              </h2>
              <p className="text-base text-slate-600 dark:text-[#A2A9C3] leading-relaxed">
                Whether you need a modern website, a fresh brand identity, or engaging digital content, let&apos;s discuss your next creative project.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <a
                href={`mailto:${STUDIO_CONTACT.email}`}
                className="studio-panel flex items-center justify-between gap-4 p-4 rounded-xl group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#397BFF]/15 border border-[#397BFF]/30 flex items-center justify-center text-[#397BFF] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 dark:text-[#A2A9C3]">Email Inquiries</p>
                    <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-[#F5F7FF] truncate">
                      {STUDIO_CONTACT.email}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 dark:text-[#A2A9C3] group-hover:text-slate-900 dark:group-hover:text-[#F5F7FF] transition-colors shrink-0" />
              </a>

              <a
                href={STUDIO_CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="studio-panel flex items-center justify-between gap-4 p-4 rounded-xl group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#8555FF]/15 border border-[#8555FF]/30 flex items-center justify-center text-[#8555FF] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 dark:text-[#A2A9C3]">
                      WhatsApp &amp; Direct Line
                    </p>
                    <p className="font-mono-tabular text-sm sm:text-base font-medium text-slate-900 dark:text-[#F5F7FF]">
                      {STUDIO_CONTACT.phoneDisplay}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 dark:text-[#A2A9C3] group-hover:text-slate-900 dark:group-hover:text-[#F5F7FF] transition-colors shrink-0" />
              </a>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#A2A9C3] mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#397BFF]" />
                  <span>Location</span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-[#F5F7FF]">
                  {STUDIO_CONTACT.location}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#A2A9C3] mb-1">
                  <Globe className="w-3.5 h-3.5 text-[#8555FF]" />
                  <span>Availability</span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-[#F5F7FF]">
                  {STUDIO_CONTACT.availability}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Validated Inquiry Form */}
          <div className="lg:col-span-7">
            <form
              action="/api/contact"
              method="post"
              noValidate
              onSubmit={handleSubmit}
              className="studio-panel rounded-2xl p-6 sm:p-8 space-y-6"
            >
              <input type="hidden" name="_form" value="Contact" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-fullName"
                    className="block text-sm font-medium text-slate-900 dark:text-[#F5F7FF] mb-2"
                  >
                    Full name
                  </label>
                  <input
                    id="contact-fullName"
                    name="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Kwame Mensah"
                    value={values.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    aria-invalid={Boolean(touched.fullName && errors.fullName)}
                    className={`wf-field w-full px-4 py-3 rounded-xl text-sm ${fieldStateClass('fullName')}`}
                  />
                  {touched.fullName && errors.fullName && (
                    <p className="wf-field-error" role="alert">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-slate-900 dark:text-[#F5F7FF] mb-2"
                  >
                    Email address
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={values.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    aria-invalid={Boolean(touched.email && errors.email)}
                    className={`wf-field w-full px-4 py-3 rounded-xl text-sm ${fieldStateClass('email')}`}
                  />
                  {touched.email && errors.email && (
                    <p className="wf-field-error" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-service"
                    className="block text-sm font-medium text-slate-900 dark:text-[#F5F7FF] mb-2"
                  >
                    Service required
                  </label>
                  <select
                    id="contact-service"
                    name="service"
                    value={values.service}
                    onChange={(e) => handleChange('service', e.target.value)}
                    onBlur={() => handleBlur('service')}
                    aria-invalid={Boolean(touched.service && errors.service)}
                    className={`wf-field w-full px-4 py-3 rounded-xl text-sm ${fieldStateClass('service')}`}
                  >
                    {SERVICE_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                        className="bg-white dark:bg-[#10152B] text-slate-900 dark:text-[#F5F7FF]"
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  {touched.service && errors.service && (
                    <p className="wf-field-error" role="alert">
                      {errors.service}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-budget"
                    className="block text-sm font-medium text-slate-900 dark:text-[#F5F7FF] mb-2"
                  >
                    Estimated budget (editable)
                  </label>
                  <input
                    id="contact-budget"
                    name="budget"
                    type="text"
                    required
                    placeholder="e.g. $800 or GHS 8,000"
                    value={values.budget}
                    onChange={(e) => handleChange('budget', e.target.value)}
                    onBlur={() => handleBlur('budget')}
                    aria-invalid={Boolean(touched.budget && errors.budget)}
                    className={`wf-field w-full px-4 py-3 rounded-xl text-sm ${fieldStateClass('budget')}`}
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {BUDGET_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleChange('budget', preset)}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono-tabular transition-colors ${
                          values.budget === preset
                            ? 'bg-[#397BFF]/20 text-slate-900 dark:text-[#F5F7FF] border border-[#397BFF]/60'
                            : 'bg-slate-100 dark:bg-[#080B1A] text-slate-600 dark:text-[#A2A9C3] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  {touched.budget && errors.budget && (
                    <p className="wf-field-error" role="alert">
                      {errors.budget}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-description"
                  className="block text-sm font-medium text-slate-900 dark:text-[#F5F7FF] mb-2"
                >
                  Project description
                </label>
                <textarea
                  id="contact-description"
                  name="description"
                  rows={4}
                  required
                  placeholder="Share your goals, timeline, and whether you need a website, brand identity, or AI video concept..."
                  value={values.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                  aria-invalid={Boolean(touched.description && errors.description)}
                  className={`wf-field w-full px-4 py-3 rounded-xl text-sm resize-y ${fieldStateClass('description')}`}
                />
                {touched.description && errors.description && (
                  <p className="wf-field-error" role="alert">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Honeypot spam trap */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '-10000px',
                  width: '1px',
                  height: '1px',
                  overflow: 'hidden',
                }}
              >
                <label>
                  Leave this field empty
                  <input
                    type="text"
                    name="_hh_hp"
                    tabIndex={-1}
                    autoComplete="off"
                    value={values._hh_hp}
                    onChange={(e) => setValues((prev) => ({ ...prev, _hh_hp: e.target.value }))}
                  />
                </label>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#397BFF] to-[#8555FF] hover:opacity-95 disabled:opacity-60 text-sm font-semibold text-white transition-opacity whitespace-nowrap min-h-[48px]"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending Inquiry...' : 'Send Project Inquiry'}</span>
                </button>

                <a
                  href={whatsappDirectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-slate-600 dark:text-[#A2A9C3] hover:text-slate-900 dark:hover:text-[#F5F7FF] underline underline-offset-4 transition-colors"
                >
                  Or message via WhatsApp ({STUDIO_CONTACT.phoneDisplay})
                </a>
              </div>

              {/* Dynamic Status Container with data-state attribute */}
              <div
                data-hh-form-msg=""
                data-state={statusMessage.state === 'idle' ? undefined : statusMessage.state}
                role="status"
                aria-live="polite"
                className={statusMessage.state === 'idle' ? 'hidden' : 'block'}
              >
                <div className="flex items-start gap-3">
                  {statusMessage.state === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-2">
                    <p>{statusMessage.text}</p>
                    {statusMessage.state === 'success' && statusMessage.mode === 'stored_locally' && (
                      <div className="flex flex-wrap gap-3 pt-1 text-xs">
                        <a
                          href={`mailto:${STUDIO_CONTACT.email}?subject=Project%20Inquiry%20(${statusMessage.inquiryId || 'WebFlow'})`}
                          className="underline font-medium"
                        >
                          Email {STUDIO_CONTACT.email}
                        </a>
                        <a
                          href={STUDIO_CONTACT.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-medium"
                        >
                          Chat on WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
