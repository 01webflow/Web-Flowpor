import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const RECIPIENT_EMAIL = process.env.CONTACT_RECIPIENT_EMAIL || '01webflow@gmail.com';

interface InquiryPayload {
  fullName: string;
  email: string;
  service: string;
  budget: string;
  description: string;
  _hh_hp?: string;
}

interface StoredInquiry {
  id: string;
  fullName: string;
  email: string;
  service: string;
  budget: string;
  description: string;
  createdAt: string;
  deliveryMode: string;
}

const ALLOWED_SERVICES = new Set([
  'AI Website Design',
  'Logo & Brand Identity',
  'AI UGC & Video Content',
  'Digital Creative Design',
  'Other',
]);

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function saveInquiryLocally(inquiry: StoredInquiry): void {
  const dataDir = path.resolve(__dirname, 'data');
  const filePath = path.join(dataDir, 'inquiries.json');
  fs.mkdirSync(dataDir, { recursive: true });

  let existing: StoredInquiry[] = [];
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        existing = parsed;
      }
    } catch {
      existing = [];
    }
  }

  existing.unshift(inquiry);
  fs.writeFileSync(filePath, JSON.stringify(existing.slice(0, 200), null, 2), 'utf8');
}

async function handleContactSubmission(req: Request, res: Response): Promise<void> {
  const body = (req.body || {}) as Partial<InquiryPayload>;

  // Honeypot spam trap check
  if (typeof body._hh_hp === 'string' && body._hh_hp.trim().length > 0) {
    res.status(200).json({
      ok: true,
      mode: 'filtered',
      message: 'Submission received.',
    });
    return;
  }

  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const service = typeof body.service === 'string' ? body.service.trim() : '';
  const budget = typeof body.budget === 'string' ? body.budget.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';

  const fieldErrors: Record<string, string> = {};

  if (fullName.length < 2) {
    fieldErrors.fullName = 'Please enter your full name (at least 2 characters).';
  }
  if (!isValidEmail(email)) {
    fieldErrors.email = 'Please enter a valid email address.';
  }
  if (!ALLOWED_SERVICES.has(service)) {
    fieldErrors.service = 'Please select one of the listed studio services.';
  }
  if (budget.length < 2) {
    fieldErrors.budget = 'Please provide an estimated budget or range.';
  }
  if (description.length < 15) {
    fieldErrors.description = 'Please describe your project idea (at least 15 characters).';
  }

  if (Object.keys(fieldErrors).length > 0) {
    res.status(400).json({
      ok: false,
      error: 'Please review the highlighted fields before submitting.',
      fieldErrors,
    });
    return;
  }

  const inquiryId = `WF-${Date.now().toString(36).toUpperCase()}`;
  const createdAt = new Date().toISOString();

  // Attempt Resend API delivery if configured
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    try {
      const emailResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'WebFlow Creative Studio <onboarding@resend.dev>',
          to: [RECIPIENT_EMAIL],
          reply_to: email,
          subject: `[Studio Inquiry ${inquiryId}] ${service} — ${fullName}`,
          text: [
            `Inquiry ID: ${inquiryId}`,
            `Name: ${fullName}`,
            `Email: ${email}`,
            `Service: ${service}`,
            `Estimated Budget: ${budget}`,
            `Submitted: ${createdAt}`,
            '',
            'Project Description:',
            description,
          ].join('\n'),
        }),
      });

      if (!emailResp.ok) {
        const errText = await emailResp.text();
        res.status(502).json({
          ok: false,
          error: `Email relay returned an error (${emailResp.status}). Please contact 01webflow@gmail.com directly.`,
          detail: errText,
        });
        return;
      }

      saveInquiryLocally({
        id: inquiryId,
        fullName,
        email,
        service,
        budget,
        description,
        createdAt,
        deliveryMode: 'resend_email',
      });

      res.status(200).json({
        ok: true,
        id: inquiryId,
        mode: 'email_sent',
        message: `Inquiry ${inquiryId} was delivered to ${RECIPIENT_EMAIL}. Thank you for reaching out.`,
      });
      return;
    } catch {
      res.status(502).json({
        ok: false,
        error: 'Unable to reach the configured email service. Please email 01webflow@gmail.com or message +233243692913 directly.',
      });
      return;
    }
  }

  // Attempt Webhook delivery if configured
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL?.trim();
  if (webhookUrl) {
    try {
      const hookResp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: inquiryId,
          fullName,
          email,
          service,
          budget,
          description,
          createdAt,
          recipient: RECIPIENT_EMAIL,
        }),
      });

      if (!hookResp.ok) {
        res.status(502).json({
          ok: false,
          error: `Webhook delivery failed (${hookResp.status}). Please email 01webflow@gmail.com directly.`,
        });
        return;
      }

      saveInquiryLocally({
        id: inquiryId,
        fullName,
        email,
        service,
        budget,
        description,
        createdAt,
        deliveryMode: 'webhook',
      });

      res.status(200).json({
        ok: true,
        id: inquiryId,
        mode: 'webhook_sent',
        message: `Inquiry ${inquiryId} was forwarded to the studio webhook. We will respond via ${email}.`,
      });
      return;
    } catch {
      res.status(502).json({
        ok: false,
        error: 'Webhook request failed. Please reach out directly at 01webflow@gmail.com or +233243692913.',
      });
      return;
    }
  }

  // Honest fallback: Persist validated inquiry locally on the server and report exact relay status
  try {
    saveInquiryLocally({
      id: inquiryId,
      fullName,
      email,
      service,
      budget,
      description,
      createdAt,
      deliveryMode: 'local_archive',
    });

    res.status(200).json({
      ok: true,
      id: inquiryId,
      mode: 'stored_locally',
      message: `Inquiry ${inquiryId} was validated and saved on the studio server. Automated email forwarding requires RESEND_API_KEY or CONTACT_WEBHOOK_URL in .env — for immediate reply, send directly via Email or WhatsApp below.`,
    });
  } catch {
    res.status(500).json({
      ok: false,
      error: 'Could not persist your inquiry on the server. Please email 01webflow@gmail.com or WhatsApp +233243692913.',
    });
  }
}

function buildMinimalPdfBuffer(projectId: string): Buffer {
  const safeTitle = projectId.replace(/[^a-zA-Z0-9-_ ]/g, '').slice(0, 48) || 'Studio Project';
  const streamContent = `BT
/F1 18 Tf
54 740 Td
(WebFlow Creative Studio - Project Case Study) Tj
0 -28 Td
/F1 13 Tf
(Project Reference: ${safeTitle}) Tj
0 -22 Td
(Prepared by WebFlow Creative Studio | Ghana / Worldwide Remote) Tj
0 -22 Td
(Contact: 01webflow@gmail.com | +233 24 369 2913) Tj
ET`;

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${Buffer.byteLength(streamContent, 'utf8')} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }
  const xrefStart = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(pdf, 'utf8');
}

function handleNewsletterSubscription(req: Request, res: Response): void {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!isValidEmail(email)) {
    res.status(400).json({
      ok: false,
      error: 'Please enter a valid email address.',
    });
    return;
  }

  try {
    const dataDir = path.resolve(__dirname, 'data');
    const filePath = path.join(dataDir, 'newsletter.json');
    fs.mkdirSync(dataDir, { recursive: true });

    let subscribers: { email: string; subscribedAt: string }[] = [];
    if (fs.existsSync(filePath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (Array.isArray(parsed)) subscribers = parsed;
      } catch {
        subscribers = [];
      }
    }

    const exists = subscribers.some((entry) => entry.email === email);
    if (!exists) {
      subscribers.unshift({ email, subscribedAt: new Date().toISOString() });
      fs.writeFileSync(filePath, JSON.stringify(subscribers.slice(0, 500), null, 2), 'utf8');
    }

    res.status(200).json({
      ok: true,
      message: exists
        ? `${email} is already subscribed to studio dispatches.`
        : `Subscribed! Studio updates and new case studies will be sent to ${email}.`,
    });
  } catch {
    res.status(500).json({
      ok: false,
      error: 'Unable to save subscription right now. Please try again.',
    });
  }
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      emailRelayConfigured: Boolean(process.env.RESEND_API_KEY || process.env.CONTACT_WEBHOOK_URL),
    });
  });

  app.post('/api/contact', handleContactSubmission);
  app.post('/__hh/form', handleContactSubmission);
  app.post('/api/newsletter', handleNewsletterSubscription);

  app.get('/api/case-study/:projectId.pdf', (req: Request, res: Response) => {
    const projectId = String(req.params.projectId || 'studio-project').replace(/[^a-zA-Z0-9-_]/g, '');
    const pdfBuffer = buildMinimalPdfBuffer(projectId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${projectId}-case-study.pdf"`);
    res.send(pdfBuffer);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`WebFlow Creative Studio server running on http://${HOST}:${PORT}`);
  });
}

startServer();
