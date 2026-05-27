// URL sanitization helpers for any component that renders consumer-supplied hrefs.
// Defends against `javascript:`, `data:`, `vbscript:` and other unsafe schemes
// that would otherwise execute arbitrary script when a user clicks a link.

/**
 * Schemes considered safe for rendering inside an <a href> attribute.
 *
 * Notably excludes:
 *   - javascript: (classic stored-XSS sink)
 *   - data:      (can deliver text/html with arbitrary script)
 *   - vbscript:  (legacy IE script execution)
 *   - file:      (local filesystem disclosure)
 *   - blob:      (depends on origin; safer to require explicit opt-in)
 */
const SAFE_URL_SCHEMES: ReadonlyArray<string> = [
	'http',
	'https',
	'mailto',
	'tel',
	'sms',
	'ftp',
	'ftps',
];

/**
 * Matches the scheme portion of an absolute URL, e.g. "javascript" in "javascript:alert(1)".
 * Per RFC 3986, scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." ).
 */
const SCHEME_PATTERN = /^([a-z][a-z0-9+.-]*):/i;

/**
 * Returns the input href if it uses a safe scheme or is relative;
 * returns `undefined` if the href would execute script when clicked
 * (e.g. `javascript:`, `data:`, `vbscript:`).
 *
 * In non-production builds, refused URLs trigger a `console.warn` so
 * consumers passing untrusted data discover the rejection immediately.
 *
 * Relative URLs (paths starting with `/`, `.`, `#`, `?`, or with no scheme
 * at all) are always allowed — they cannot specify a scheme.
 */
export function sanitizeUrl(href: string | undefined): string | undefined {
	if (href === undefined || href === null) return undefined;
	const trimmed = String(href).trim();
	if (trimmed === '') return trimmed;

	// Relative URL prefixes — no scheme can appear, so always safe.
	if (/^(\/|\.|#|\?)/.test(trimmed)) return trimmed;

	const match = SCHEME_PATTERN.exec(trimmed);
	if (!match) {
		// No scheme at all (e.g. "example.com/foo") — treat as relative; cannot inject script.
		return trimmed;
	}

	const scheme = match[1].toLowerCase();
	if (SAFE_URL_SCHEMES.includes(scheme)) {
		return trimmed;
	}

	if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
		console.warn(
			`[@liiift-studio/mac-os9-ui] Refused unsafe URL scheme "${scheme}:" in href. ` +
				`Allowed schemes: ${SAFE_URL_SCHEMES.join(', ')}, plus relative URLs.`,
		);
	}
	return undefined;
}
