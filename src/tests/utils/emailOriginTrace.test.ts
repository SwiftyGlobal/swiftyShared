import { buildEmailOriginTrace, EMAIL_TRACE_MARKER_KEY } from '../../utils/emailOriginTrace';

// Shared origin/trace marker for outbound backend emails. Lives in swifty-shared so
// every backend sender (worker, gaming) stamps an IDENTICAL marker — one grep pattern
// works across all of them.
//
// White-label constraint: these emails are branded per customer, so the marker MUST
// NOT leak the platform vendor name. It uses a neutral key that reads as a generic
// message id and carries only the id.

describe('buildEmailOriginTrace', () => {
  it('exposes a neutral, vendor-free marker key', () => {
    expect(EMAIL_TRACE_MARKER_KEY).toBe('x-mid');
  });

  it('returns a v4-style uuid as trace_id', () => {
    const { trace_id } = buildEmailOriginTrace();
    expect(trace_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('generates a unique trace_id per call', () => {
    expect(buildEmailOriginTrace().trace_id).not.toBe(buildEmailOriginTrace().trace_id);
  });

  it('labels the id with the neutral x-mid key', () => {
    const { trace_id, html } = buildEmailOriginTrace();
    expect(html).toContain(`x-mid:${trace_id}`);
  });

  it('embeds the id in an HTML comment (survives DOM-stripping forwards)', () => {
    const { trace_id, html } = buildEmailOriginTrace();
    expect(html).toMatch(new RegExp(`<!--[^>]*x-mid:${trace_id}[^>]*-->`));
  });

  it('embeds the id in a visually-hidden span (survives comment-stripping forwards)', () => {
    const { trace_id, html } = buildEmailOriginTrace();
    expect(html).toMatch(/<span[^>]*display:\s*none[^>]*>/i);
    expect(html).toContain(`x-mid:${trace_id}`);
  });

  it('does NOT leak the vendor name (white-label safe)', () => {
    const { html } = buildEmailOriginTrace();
    expect(html.toLowerCase()).not.toContain('swifty');
    expect(html.toLowerCase()).not.toContain('origin');
  });

  it('honours a caller-supplied trace_id instead of generating one', () => {
    const fixed = '11111111-1111-4111-8111-111111111111';
    const { trace_id, html } = buildEmailOriginTrace(fixed);
    expect(trace_id).toBe(fixed);
    expect(html).toContain(fixed);
  });

  it('produces html with no raw newlines (safe to append to an email body)', () => {
    expect(buildEmailOriginTrace().html.includes('\n')).toBe(false);
  });
});
