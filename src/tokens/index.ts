// Mac OS 9 Design Tokens
// Extracted from Figma file: vy2T5MCXFz7QWf4Ba86eqN
// Reference: docs/figma-map.md
//
// NOTE: These TypeScript tokens MUST stay in sync with the CSS custom
// properties declared in src/styles/tokens.css. Components consume the CSS
// variables at runtime; this TS export is the public API for consumers
// who want to read the same values from JavaScript. Keep both files
// updated together when changing any token value.

/**
 * Color tokens based on Mac OS 9 grayscale palette
 * Extracted from Figma styles and component analysis
 */
export const colors = {
	// Grayscale palette (Figma style IDs included for reference)
	gray100: '#FFFFFF', // 18:47 - White
	gray200: '#EEEEEE', // 19:2507 - Base UI background
	gray300: '#DDDDDD', // 18:60 - Inferred mid-tone
	gray400: '#CCCCCC', // 18:1970 - Inferred mid-tone
	gray450: '#CBCBCB', // Title bar fill (matches --color-gray-450)
	gray475: '#C5C5C5', // Title bar pattern shade (matches --color-gray-475)
	gray500: '#BBBBBB', // 20:7306 - Inferred mid-tone (matches --color-gray-500)
	gray550: '#999999', // Pinstripe rule (matches --color-gray-550)
	gray600: '#666666', // 18:52 - Inferred dark tone
	gray650: '#555555', // Inset border (matches --color-gray-650)
	gray700: '#4D4D4D', // 18:46 - Inferred dark tone
	gray800: '#333333', // 45:184845 - Inferred very dark
	gray900: '#262626', // 18:48 - Black (strokes, borders, text)

	// Accent colors
	lavender: '#CCCCFF', // 60:134029 - Cover background
	azul: '#0066CC', // 49:36229 - Accent (inferred)
	linkRed: '#CC0000', // 102:398, 102:3935 - Link color (inferred)
	blueHighlight: '#0000BB', // Classic menu / selection highlight

	// Semantic mappings
	background: '#EEEEEE', // Gray 200
	foreground: '#262626', // Gray 900
	border: '#262626', // Gray 900
	text: '#262626', // Gray 900
	textInverse: '#FFFFFF', // Gray 100
	surface: '#EEEEEE', // Gray 200
	surfaceInset: '#FFFFFF', // Gray 100 (for inset areas)
	surfaceRaised: '#DDDDDD', // Gray 300
	borderInset: '#555555', // Gray 650
	highlight: '#0000BB', // Selection / menu highlight
	highlightText: '#FFFFFF', // Text on highlight

	// Legacy names for compatibility
	black: '#262626',
	white: '#FFFFFF',

	// Status colors (Mac OS 9 style)
	focus: '#000080',
	error: '#CC0000',
	success: '#008000',
	warning: '#FF8C00',
} as const;

/**
 * Typography tokens
 * Based on Figma text styles and authentic Mac OS 9 system fonts
 * 
 * Mac OS 9 Typography:
 * - Charcoal: Primary system UI font (menus, buttons, dialogs)
 * - Geneva: Body text and secondary UI elements
 * - Chicago: Classic Mac system font (menu bar, earlier versions)
 * - Apple Garamond: Headlines and editorial content
 */
export const typography = {
	fontFamily: {
		// Primary system UI font. Mirrors --font-system: the bundled Pixel
		// bitmap face, falling back through system UI sans stacks.
		system:
			"'Pixel', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",

		// Body text. Mirrors --font-body. IBM Plex Sans is only present when
		// the consumer opts in to '@liiift-studio/mac-os9-ui/webfonts'.
		body: "'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",

		// Display / headline face. Mirrors --font-display.
		display:
			"'Pixel', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",

		// Editorial serif. Mirrors --font-title. Requires /webfonts for EB Garamond.
		title: "'EB Garamond', Garamond, Georgia, 'Times New Roman', serif",

		// Monospace. Mirrors --font-mono. Requires /webfonts for IBM Plex Mono.
		mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace",

		// The bundled pixel faces, addressable directly. Mirrors --font-pixel
		// and --font-pixel-small.
		pixel: "'Pixel', ui-sans-serif, system-ui, sans-serif",
		pixelSmall: "'PixelSmall', 'Pixel', ui-sans-serif, system-ui, sans-serif",
	},
	// Values are rem so they scale with the responsive <html> font-size set by
	// base.css. The px comments are the rendered size at a 16px root.
	fontSize: {
		xs: '0.5625rem', // 9px  - smallest UI text
		sm: '0.625rem',  // 10px - small labels
		md: '0.75rem',   // 12px - standard UI text (Mac OS 9 default)
		lg: '0.8125rem', // 13px - slightly larger UI text
		xl: '0.875rem',  // 14px - large UI text
		'2xl': '1rem',     // 16px - headings
		'3xl': '1.125rem', // 18px - large headings
		'4xl': '1.25rem',  // 20px - major headings
		'5xl': '1.5rem',   // 24px - display text
	},
	// The bundled Pixel family ships exactly two real weights, 400 and 700, in
	// both roman and italic, so nothing here is ever synthesised by the browser.
	// `normal` is 700 on purpose: Mac OS 9's Charcoal reads as bold, and
	// matching it is the point of the library. Use `regular` for the 400 face.
	fontWeight: {
		regular: 400,  // Pixel Regular - the true 400 face
		light: 400,    // Alias of regular; Pixel has no lighter face
		normal: 700,   // Charcoal-like bold - Mac OS 9 UI default
		medium: 700,   // No real 500 face; resolves to bold
		semibold: 700, // No real 600 face; resolves to bold
		bold: 700,     // Pixel Bold - the true 700 face
	},
	lineHeight: {
		tight: 1.2,    // Tight leading (Mac OS 9 style)
		snug: 1.3,     // Snug
		normal: 1.4,   // Normal (Mac OS 9 used tighter line heights)
		relaxed: 1.5,  // Relaxed
		loose: 1.6,    // Loose
	},
	letterSpacing: {
		tighter: '-0.02em', // Slightly tighter
		tight: '-0.01em',   // Tight
		normal: '0',        // Normal - Mac OS 9 default
		wide: '0.01em',     // Wide
		wider: '0.02em',    // Wider
	},
} as const;

/**
 * Spacing tokens based on Mac OS 9 measurements
 * Mac OS 9 used tight spacing; using 2px as base unit
 */
export const spacing = {
	'0': '0',
	px: '1px',
	'0.5': '2px', // Minimal spacing
	'1': '4px', // Base grid unit
	'1.5': '6px',
	'2': '8px',
	'2.5': '10px',
	'3': '12px',
	'4': '16px',
	'5': '20px',
	'6': '24px',
	'8': '32px',
	'10': '40px',
	'12': '48px',
	'16': '64px',

	// Legacy names
	xs: '2px',
	sm: '4px',
	md: '8px',
	lg: '12px',
	xl: '16px',
	'2xl': '24px',
	'3xl': '32px',
} as const;

/**
 * Shadow tokens for Mac OS 9 bevel effects
 * Exact values from Figma Window Shadow effect (67:95038)
 * 
 * Classic 3-layer bevel:
 * 1. Hard drop shadow (2px, 2px, 0 blur) - creates depth
 * 2. Top-left highlight (light inner shadow)
 * 3. Bottom-right shadow (dark inner shadow)
 */
export const shadows = {
	// Standard raised bevel (default button state)
	bevel:
		'inset 2px 2px 0 rgba(255, 255, 255, 0.6), inset -2px -2px 0 rgba(38, 38, 38, 0.4), 2px 2px 0 rgba(38, 38, 38, 1)',

	// Inverted bevel for pressed/inset states
	inset:
		'inset -2px -2px 0 rgba(255, 255, 255, 0.6), inset 2px 2px 0 rgba(38, 38, 38, 0.4), inset 0px 0px 0px rgba(38, 38, 38, 1)',

	// Individual layers for custom composition
	dropShadow: '2px 2px 0 rgba(38, 38, 38, 1)',
	innerHighlight: 'inset 2px 2px 0 rgba(255, 255, 255, 0.6)',
	innerShadow: 'inset -2px -2px 0 rgba(38, 38, 38, 0.4)',

	// Soft drop used by floating surfaces (dropdowns, dialogs). Mirrors --shadow-float.
	float: '2px 2px 0 rgba(0, 0, 0, 0.5)',

	// Legacy format for compatibility
	raised: {
		highlight: 'inset 2px 2px 0 rgba(255, 255, 255, 0.6)',
		shadow: 'inset -2px -2px 0 rgba(38, 38, 38, 0.4)',
		full: 'inset 2px 2px 0 rgba(255, 255, 255, 0.6), inset -2px -2px 0 rgba(38, 38, 38, 0.4), 2px 2px 0 rgba(38, 38, 38, 1)',
	},

	// No shadow (flat)
	none: 'none',
} as const;

/**
 * Border tokens
 * Mac OS 9 used consistent 1px borders with sharp corners
 */
export const borders = {
	width: {
		none: '0',
		thin: '1px',
		medium: '2px',
		thick: '3px',
	},
	style: {
		solid: 'solid',
		dashed: 'dashed',
		dotted: 'dotted',
		none: 'none',
	},
	radius: {
		none: '0', // Mac OS 9 always used square corners
		sm: '0', // Kept for API consistency
		md: '0',
		lg: '0',
		full: '0',
	},
} as const;

/**
 * Z-index scale for layering
 */
export const zIndex = {
	base: 0,
	dropdown: 1000,
	sticky: 1100,
	modal: 1200,
	popover: 1300,
	tooltip: 1400,
} as const;

/**
 * Transition/Animation tokens
 * Mac OS 9 had minimal animations, but we add subtle ones for modern feel
 */
export const transitions = {
	duration: {
		instant: '0ms',
		fast: '100ms',
		normal: '200ms',
		slow: '300ms',
	},
	timing: {
		linear: 'linear',
		easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
		easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
		easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
	},
} as const;

// Export all tokens as a single object
export const tokens = {
	colors,
	typography,
	spacing,
	borders,
	shadows,
	zIndex,
	transitions,
} as const;

export default tokens;