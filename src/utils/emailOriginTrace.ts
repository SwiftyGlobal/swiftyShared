import { randomUUID } from 'crypto';

/**
 * Neutral, vendor-free marker key. Backend emails are white-labelled per customer,
 * so the key must reveal nothing about the platform vendor. "x-mid" reads as a
 * generic message id (the kind any mail system embeds) and is the single string our
 * tooling greps for to identify a backend-sent email and extract its trace id.
 */
export const EMAIL_TRACE_MARKER_KEY = 'x-mid';

export interface EmailOriginTrace {
  trace_id: string;
  html: string;
}

/**
 * Build a hidden, forward-surviving trace marker for outbound backend emails.
 *
 * Shared across every backend sender (worker, gaming, ...) so the marker is IDENTICAL
 * everywhere — one grep pattern works across all of them, and it can't drift.
 *
 * Why: emails our backend sends must be identifiable when a customer later forwards
 * them to support. The marker lets us (1) recognise an email as ours (external ESP
 * emails won't carry it) and (2) map a forwarded .eml 1:1 to its user_audit_log row
 * via the trace id.
 *
 * White-label constraint: the marker carries ONLY the id under a neutral key — no
 * vendor name, no "origin", no brand. Any origin/brand context lives in the audit
 * log (internal), never in the branded email body.
 *
 * Emitted twice on purpose:
 *  - an HTML comment: survives clients that strip hidden DOM but keep comments;
 *  - a display:none span: survives clients (e.g. Gmail forward) that strip comments
 *    but keep the DOM.
 * At least one reliably survives a forward, and both are invisible to the recipient.
 *
 * @param traceId - optional caller-supplied id (else a v4 uuid is generated)
 */
export function buildEmailOriginTrace(traceId?: string): EmailOriginTrace {
  const id = traceId || randomUUID();
  const marker = `${EMAIL_TRACE_MARKER_KEY}:${id}`;
  const hiddenStyle =
    'display:none;font-size:0;line-height:0;max-height:0;max-width:0;' +
    'overflow:hidden;mso-hide:all;color:transparent';
  const html = `<!-- ${marker} --><span style="${hiddenStyle}">${marker}</span>`;
  return { trace_id: id, html };
}
