// Mac OS 9 Design Tokens
// Extracted from Figma file: vy2T5MCXFz7QWf4Ba86eqN
// Reference: docs/figma-map.md
//
// NOTE: These TypeScript tokens MUST stay in sync with the CSS custom
// properties declared in src/styles/theme.css. Components consume the CSS
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
	gray500: '#BBBBBB', // 20:7306 - Inferred mid-tone (matches --color-gray-500)
	gray600: '#666666', // 18:52 - Inferred dark tone
	gray700: '#4D4D4D', // 18:46 - Inferred dark tone
	gray800: '#333333', // 45:184845 - Inferred very dark
	gray900: '#262626', // 18:48 - Black (strokes, borders, text)

	// Accent colors
	lavender: '#CCCCFF', // 60:134029 - Cover background
	azul: '#0066CC', // 49:36229 - Accent (inferred)
	linkRed: '#CC0000', // 102:398, 102:3935 - Link color (inferred)

	// Semantic mappings
	background: '#EEEEEE', // Gray 200
	foreground: '#262626', // Gray 900
	border: '#262626', // Gray 900
	text: '#262626', // Gray 900
	textInverse: '#FFFFFF', // Gray 100
	surface: '#EEEEEE', // Gray 200
	surfaceInset: '#FFFFFF', // Gray 100 (for inset areas)

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
		// Charcoal - Primary system UI font used throughout Mac OS 9
		// Fallback chain: Try Charcoal variants, then Chicago, then modern system fonts
		system: 'Charcoal, "Charcoal CY", Chicago, "Chicago Classic", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
		
		// Geneva - Used for dialog text and body content in Mac OS 9
		// More readable for longer text than Charcoal
		body: 'Geneva, "Geneva CY", "Lucida Grande", "Lucida Sans Unicode", sans-serif',
		
		// Apple Garamond Light - Used for headlines in Figma
		display: '"Apple Garamond Light", "Apple Garamond", Garamond, Georgia, serif',
		
		// Chicago - Classic Mac OS system font (menu bar, classic UI)
		chicago: 'Chicago, "Chicago Classic", "Charcoal CY", Charcoal, monospace',
		
		// Monaco - Mac OS 9 monospace font
		mono: 'Monaco, "Monaco CY", "SF Mono", "Courier New", Courier, monospace',
	},
	fontSize: {
		xs: '9px',   // Smallest UI text (9pt Chicago/Charcoal)
		sm: '10px',  // Small labels (10pt)
		md: '12px',  // Standard UI text - Mac OS 9 default (12pt)
		lg: '13px',  // Slightly larger UI text
		xl: '14px',  // Large UI text
		'2xl': '16px',  // Headings
		'3xl': '18px',  // Large headings
		'4xl': '20px',  // Major headings
		'5xl': '24px',  // Display text
	},
	fontWeight: {
		normal: 700,   // Charcoal Bold is the Mac OS 9 default
		medium: 700,   // Medium (same as bold for Charcoal)
		semibold: 700, // Semibold (same as bold)
		bold: 700,     // Bold weight
		light: 400,    // Light weight (regular Charcoal)
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
		'inset -2px -2px 0 rgba(255, 255, 255, 0.6), inset 2px 2px 0 rgba(38, 38, 38, 0.4), 2px 2px 0 rgba(38, 38, 38, 1)',

	// Individual layers for custom composition
	dropShadow: '2px 2px 0 rgba(38, 38, 38, 1)',
	innerHighlight: 'inset 2px 2px 0 rgba(255, 255, 255, 0.6)',
	innerShadow: 'inset -2px -2px 0 rgba(38, 38, 38, 0.4)',

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