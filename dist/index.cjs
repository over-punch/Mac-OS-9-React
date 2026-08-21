"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var reactDom = require('react-dom');

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
const SAFE_URL_SCHEMES = [
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
function sanitizeUrl(href) {
    if (href === undefined || href === null)
        return undefined;
    const trimmed = String(href).trim();
    if (trimmed === '')
        return trimmed;
    // Relative URL prefixes — no scheme can appear, so always safe.
    if (/^(\/|\.|#|\?)/.test(trimmed))
        return trimmed;
    const match = SCHEME_PATTERN.exec(trimmed);
    if (!match) {
        // No scheme at all (e.g. "example.com/foo") — treat as relative; cannot inject script.
        return trimmed;
    }
    const scheme = (match[1] ?? '').toLowerCase();
    if (SAFE_URL_SCHEMES.includes(scheme)) {
        return trimmed;
    }
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
        console.warn(`[@liiift-studio/mac-os9-ui] Refused unsafe URL scheme "${scheme}:" in href. ` +
            `Allowed schemes: ${SAFE_URL_SCHEMES.join(', ')}, plus relative URLs.`);
    }
    return undefined;
}

// Utility for merging CSS class names
// Filters out falsy values and joins valid class names with spaces
/**
 * Merges multiple class names into a single string.
 *
 * Keeps only non-empty strings. A plain `.filter(Boolean)` would keep a
 * truthy number too, so `mergeClasses(styles.row, itemCount)` would have
 * emitted `class="row 5"`; here the number is dropped.
 *
 * @param classes - Class names to merge
 * @returns Merged class name string
 *
 * @example
 * ```ts
 * mergeClasses('base', isActive && 'active', undefined, 'custom')
 * // Returns: "base active custom"
 * ```
 */
const mergeClasses = (...classes) => {
    return classes
        .filter((value) => typeof value === 'string' && value !== '')
        .join(' ');
};
/**
 * Creates a class name builder function with a base class
 * Useful for component-level class management
 *
 * @param baseClass - Base class name
 * @returns Function that merges additional classes with base
 *
 * @example
 * ```ts
 * const cn = createClassBuilder('button');
 * cn('primary', isDisabled && 'disabled')
 * // Returns: "button primary disabled"
 * ```
 */
const createClassBuilder = (baseClass) => {
    return (...additionalClasses) => {
        return mergeClasses(baseClass, ...additionalClasses);
    };
};

var styles$e = {"button":"Button-module_button","button--sm":"Button-module_button--sm","button--md":"Button-module_button--md","button--lg":"Button-module_button--lg","button--default":"Button-module_button--default","button--primary":"Button-module_button--primary","button--danger":"Button-module_button--danger","button--disabled":"Button-module_button--disabled","button--full-width":"Button-module_button--full-width","button--loading":"Button-module_button--loading","button--cursor-loading":"Button-module_button--cursor-loading","button__loading-spinner":"Button-module_button__loading-spinner","button__text":"Button-module_button__text","button__icon-left":"Button-module_button__icon-left","button__icon-right":"Button-module_button__icon-right","button__icon-only":"Button-module_button__icon-only","button--icon-only":"Button-module_button--icon-only"};

/**
 * Mac OS 9 style Button component
 *
 * Polymorphic component that can render as button or link with consistent styling.
 *
 * Features:
 * - Classic 3-layer bevel effect (highlight, shadow, drop shadow)
 * - Polymorphic - renders as `<button>` or `<a>` based on the `as` prop, or
 *   defers to a router link via `asChild`
 * - Loading states with optional Mac OS 9 watch cursor
 * - Icon support (left, right, or icon-only)
 * - Standard `aria-*` attributes pass straight through
 * - Form integration props
 * - Auto-security for external links
 *
 * @example
 * ```tsx
 * // Button
 * <Button onClick={handleClick}>Click Me</Button>
 * <Button variant="primary" size="lg">Primary Action</Button>
 * <Button loading loadingText="Saving...">Save</Button>
 *
 * // Link styled as button
 * <Button as="a" href="/dashboard">Go to Dashboard</Button>
 * <Button as="a" href="https://example.com" target="_blank">
 *   External Link
 * </Button>
 *
 * // Router link
 * <Button asChild>
 *   <Link href="/dashboard">Go to Dashboard</Link>
 * </Button>
 *
 * // With icons
 * <Button leftIcon={<FolderIcon />}>Open</Button>
 * <Button iconOnly aria-label="Close">
 *   <CloseIcon />
 * </Button>
 * ```
 */
const ButtonImpl = React.forwardRef((props, ref) => {
    const { variant = 'default', size = 'md', disabled = false, fullWidth = false, loading = false, loadingText, useCursorLoading = false, leftIcon, rightIcon, iconOnly = false, asChild = false, ariaLabel, ariaDescribedBy, ariaPressed, className = '', children, ...restProps } = props;
    // Standard aria-* attributes win over the deprecated camelCase aliases.
    const { 'aria-label': ariaLabelAttr, 'aria-describedby': ariaDescribedByAttr, 'aria-pressed': ariaPressedAttr, ...domProps } = restProps;
    const resolvedAriaLabel = ariaLabelAttr ?? ariaLabel;
    const resolvedAriaDescribedBy = ariaDescribedByAttr ?? ariaDescribedBy;
    const resolvedAriaPressed = ariaPressedAttr ?? ariaPressed;
    // An icon-only button with no resolvable accessible name is a control a
    // screen reader announces as just "button". Fail loudly in development
    // instead of shipping it silently.
    const iconOnlyFallbackLabel = typeof children === 'string' ? children : undefined;
    if (process.env.NODE_ENV !== 'production' &&
        iconOnly &&
        !resolvedAriaLabel &&
        !iconOnlyFallbackLabel) {
        console.error('Button: `iconOnly` was set but no accessible name could be determined. ' +
            'Pass `aria-label`, because non-string children cannot supply one.');
    }
    // Determine if rendering as link
    const isLink = props.as === 'a';
    // Build class names
    const classNames = mergeClasses(styles$e.button, styles$e[`button--${variant}`], styles$e[`button--${size}`], fullWidth && styles$e['button--full-width'], disabled && styles$e['button--disabled'], loading && styles$e['button--loading'], loading && useCursorLoading && styles$e['button--cursor-loading'], iconOnly && styles$e['button--icon-only'], (leftIcon || rightIcon) && styles$e['button--with-icon'], className);
    // Shared ARIA. These are spread AFTER the caller's remaining props so a
    // stray `aria-disabled`/`aria-busy` in the rest props can't contradict the
    // component's own `disabled`/`loading` state.
    //
    // The library's rule for disabled state, applied consistently across every
    // component:
    //
    //   - An element with a native disabled attribute (button, input, select,
    //     textarea) uses that alone. It already removes the element from the
    //     accessibility tree and the tab order, and a redundant aria-disabled
    //     is one more thing that can drift out of sync with it.
    //   - An element with no native equivalent (an anchor, a RadioGroup
    //     wrapper, an asChild target) carries aria-disabled instead, with the
    //     behaviour enforced in the event handler.
    //
    // aria-disabled is set here for the anchor and asChild branches; the
    // <button> branch below clears it.
    const sharedAria = {
        'aria-label': iconOnly ? (resolvedAriaLabel ?? iconOnlyFallbackLabel) : resolvedAriaLabel,
        'aria-describedby': resolvedAriaDescribedBy,
        'aria-pressed': resolvedAriaPressed,
        'aria-disabled': disabled || loading || undefined,
        'aria-busy': loading || undefined,
    };
    // Render button content with icons and loading state
    function renderButtonContent() {
        // Show loading state
        if (loading) {
            return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [!useCursorLoading && (jsxRuntime.jsx("span", { className: styles$e['button__loading-spinner'], "aria-hidden": "true", children: "\u23F3" })), jsxRuntime.jsx("span", { className: styles$e['button__text'], children: loadingText || children })] }));
        }
        // Icon-only button
        if (iconOnly) {
            return jsxRuntime.jsx("span", { className: styles$e['button__icon-only'], children: children });
        }
        // Button with icons
        return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [leftIcon && (jsxRuntime.jsx("span", { className: styles$e['button__icon-left'], "aria-hidden": "true", children: leftIcon })), jsxRuntime.jsx("span", { className: styles$e['button__text'], children: children }), rightIcon && (jsxRuntime.jsx("span", { className: styles$e['button__icon-right'], "aria-hidden": "true", children: rightIcon }))] }));
    }
    // --- asChild: hand rendering to the caller's element -------------------
    //
    // The child owns the element and its own href/navigation; Button only
    // contributes styling, ARIA, and the disabled/loading behaviour.
    if (asChild) {
        const child = React.Children.only(children);
        if (!React.isValidElement(child)) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Button: `asChild` expects a single React element child.');
            }
            return null;
        }
        const childProps = child.props;
        return React.cloneElement(child, {
            ...domProps,
            ...sharedAria,
            ref,
            className: mergeClasses(classNames, childProps.className),
            onClick: (event) => {
                if (disabled || loading) {
                    event.preventDefault();
                    return;
                }
                childProps.onClick?.(event);
            },
        });
    }
    // --- Anchor ------------------------------------------------------------
    if (isLink) {
        const { href, target, rel, download, onClick, ...linkProps } = domProps;
        // Block javascript:/data:/vbscript: hrefs before they reach the DOM.
        // sanitizeUrl returns undefined for unsafe schemes; an anchor with no
        // href is non-functional but still visible, which is the desired
        // fail-closed behavior for untrusted input.
        const safeHref = sanitizeUrl(href);
        // Auto-add security rel for external links
        let finalRel = rel;
        if (target === '_blank' && !rel) {
            finalRel = 'noopener noreferrer';
        }
        // Anchors have no native disabled state, so aria-disabled carries the
        // meaning and the click handler enforces it.
        const handleClick = (event) => {
            if (disabled || loading) {
                event.preventDefault();
                return;
            }
            onClick?.(event);
        };
        return (jsxRuntime.jsx("a", { ...linkProps, ref: ref, href: disabled || loading ? undefined : safeHref, target: target, rel: finalRel, download: download, className: classNames, onClick: handleClick, ...sharedAria, children: renderButtonContent() }));
    }
    // --- Button ------------------------------------------------------------
    const { type = 'button', form, formAction, formMethod, formNoValidate, formTarget, ...buttonProps } = domProps;
    return (jsxRuntime.jsx("button", { ...buttonProps, ref: ref, type: type, disabled: disabled || loading, form: form, formAction: formAction, formMethod: formMethod, formNoValidate: formNoValidate, formTarget: formTarget, className: classNames, ...sharedAria, "aria-disabled": undefined, children: renderButtonContent() }));
});
ButtonImpl.displayName = 'Button';
const Button = ButtonImpl;

var styles$d = {"icon":"Icon-module_icon","icon--xs":"Icon-module_icon--xs","icon--sm":"Icon-module_icon--sm","icon--md":"Icon-module_icon--md","icon--lg":"Icon-module_icon--lg","icon--xl":"Icon-module_icon--xl"};

/**
 * Icon component for Mac OS 9 UI
 *
 * Wraps SVG content with consistent sizing and styling.
 * Use for inline icons in buttons, labels, etc.
 *
 * @example
 * ```tsx
 * <Icon size="sm">
 *   <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
 * </Icon>
 *
 * <Icon label="Close" size="md">
 *   <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
 * </Icon>
 * ```
 */
const Icon = React.forwardRef(({ size = 'md', children, label, className = '', ...props }, ref) => {
    const classNames = mergeClasses(styles$d.icon, styles$d[`icon--${size}`], className);
    return (jsxRuntime.jsx("svg", { ref: ref, className: classNames, viewBox: "0 0 24 24", fill: "currentColor", xmlns: "http://www.w3.org/2000/svg", "aria-label": label, "aria-hidden": !label, role: label ? 'img' : 'presentation', ...props, children: children }));
});
Icon.displayName = 'Icon';

/** Character → fill. Anything not listed here is left transparent. */
const PIXEL_FILLS = {
    '#': 'currentColor',
    o: 'var(--color-gray-100)',
    x: 'var(--color-gray-550)',
};
/**
 * Expands a pixel map into `<rect>` elements.
 *
 * Horizontally adjacent pixels of the same colour are merged into a single
 * wider rect. A 16×16 icon is 256 potential nodes; run-length merging
 * typically cuts that by three quarters, which matters when a list view
 * renders one icon per row.
 */
function pixelsToRects(map) {
    const rects = [];
    map.forEach((row, y) => {
        let runStart = -1;
        let runFill;
        const flush = (endX) => {
            if (runStart === -1 || !runFill)
                return;
            rects.push(jsxRuntime.jsx("rect", { x: runStart, y: y, width: endX - runStart, height: 1, fill: runFill }, `${runStart}-${y}`));
            runStart = -1;
            runFill = undefined;
        };
        for (let x = 0; x < row.length; x += 1) {
            const fill = PIXEL_FILLS[row[x] ?? '.'];
            if (fill !== runFill) {
                flush(x);
                if (fill) {
                    runStart = x;
                    runFill = fill;
                }
            }
        }
        flush(row.length);
    });
    return rects;
}
/**
 * Builds an icon component from a pixel map.
 *
 * @param displayName - React display name, e.g. `FolderIcon`
 * @param label - Default accessible name
 * @param map - The pixel map, one string per row
 * @param gridSize - Width/height of the square pixel grid
 */
function createPixelIcon(displayName, label, map, gridSize = 16) {
    const rects = pixelsToRects(map);
    const Component = ({ label: labelOverride, ...props }) => (jsxRuntime.jsx(Icon, { viewBox: `0 0 ${gridSize} ${gridSize}`, shapeRendering: "crispEdges", label: labelOverride === null ? undefined : (labelOverride ?? label), ...props, children: rects }));
    Component.displayName = displayName;
    return Component;
}

// Action-related icons - Mac OS 9 React UI
// User-initiated actions and commands
/** Close cross. */
const CloseIcon = createPixelIcon('CloseIcon', 'Close', [
    '................',
    '................',
    '..##........##..',
    '..###......###..',
    '...###....###...',
    '....###..###....',
    '.....######.....',
    '......####......',
    '......####......',
    '.....######.....',
    '....###..###....',
    '...###....###...',
    '..###......###..',
    '..##........##..',
    '................',
    '................',
]);
/** Wastebasket. */
const TrashIcon = createPixelIcon('TrashIcon', 'Trash', [
    '................',
    '......####......',
    '.....#....#.....',
    '..############..',
    '................',
    '..############..',
    '..#..#..#..#.#..',
    '..#..#..#..#.#..',
    '..#..#..#..#.#..',
    '..#..#..#..#.#..',
    '..#..#..#..#.#..',
    '..#..#..#..#.#..',
    '...##########...',
    '................',
    '................',
    '................',
]);
/** Magnifying glass. */
const SearchIcon = createPixelIcon('SearchIcon', 'Search', [
    '................',
    '....######......',
    '...#......#.....',
    '..#........#....',
    '.#..........#...',
    '.#..........#...',
    '.#..........#...',
    '.#..........#...',
    '..#........#....',
    '...#......#.....',
    '....######.#....',
    '.........#.##...',
    '............##..',
    '.............##.',
    '..............#.',
    '................',
]);
/** Two stacked sheets. */
const CopyIcon = createPixelIcon('CopyIcon', 'Copy', [
    '................',
    '..########......',
    '..#......#......',
    '..#......#......',
    '..#..########...',
    '..#..#......#...',
    '..#..#......#...',
    '..#..#......#...',
    '..####......#...',
    '.....#......#...',
    '.....#......#...',
    '.....#......#...',
    '.....########...',
    '................',
    '................',
    '................',
]);
/** Dot-matrix printer. */
const PrintIcon = createPixelIcon('PrintIcon', 'Print', [
    '................',
    '....########....',
    '....#......#....',
    '....#......#....',
    '....########....',
    '..############..',
    '.#............#.',
    '.#..........#.#.',
    '.#............#.',
    '..############..',
    '....########....',
    '....#......#....',
    '....#......#....',
    '....########....',
    '................',
    '................',
]);
/** Downward arrow into a tray. */
const DownloadIcon = createPixelIcon('DownloadIcon', 'Download', [
    '................',
    '.......##.......',
    '.......##.......',
    '.......##.......',
    '.......##.......',
    '.......##.......',
    '..##.......##...',
    '...##.....##....',
    '....##...##.....',
    '.....##.##......',
    '......###.......',
    '................',
    '..############..',
    '..#..........#..',
    '..############..',
    '................',
]);
/** Chain link. */
const LinkIcon = createPixelIcon('LinkIcon', 'Link', [
    '................',
    '................',
    '................',
    '...####..####...',
    '..##..#..#..##..',
    '.##...#..#...##.',
    '.#....####....#.',
    '.#....####....#.',
    '.##...#..#...##.',
    '..##..#..#..##..',
    '...####..####...',
    '................',
    '................',
    '................',
    '................',
    '................',
]);
/** Sealed envelope. */
const MailIcon = createPixelIcon('MailIcon', 'Mail', [
    '................',
    '................',
    '..############..',
    '..##........##..',
    '..#.##....##.#..',
    '..#...####...#..',
    '..#....##....#..',
    '..#..........#..',
    '..#..........#..',
    '..#..........#..',
    '..#..........#..',
    '..############..',
    '................',
    '................',
    '................',
    '................',
]);

// File and folder icons - Mac OS 9 React UI
// Documents, folders, applications, and volumes
/** Classic Mac OS folder with its tab. */
const FolderIcon = createPixelIcon('FolderIcon', 'Folder', [
    '................',
    '................',
    '..####..........',
    '.#....#.........',
    '#......#########',
    '#..............#',
    '#..............#',
    '#..............#',
    '#..............#',
    '#..............#',
    '#..............#',
    '#..............#',
    '#..............#',
    '.##############.',
    '................',
    '................',
]);
/** Folder shown mid-open, used for the current location in a path. */
const FolderOpenIcon = createPixelIcon('FolderOpenIcon', 'Open folder', [
    '................',
    '..####..........',
    '.#....#.........',
    '#......#########',
    '#..............#',
    '#..............#',
    '#..###########..',
    '#.#...........#.',
    '#.#...........#.',
    '.#.............#',
    '.#.............#',
    '.#.............#',
    '..#############.',
    '................',
    '................',
    '................',
]);
/** Plain document with a folded corner. */
const DocumentIcon = createPixelIcon('DocumentIcon', 'Document', [
    '................',
    '..#########.....',
    '..#.......##....',
    '..#.......#.#...',
    '..#.......####..',
    '..#..........#..',
    '..#..######..#..',
    '..#..........#..',
    '..#..######..#..',
    '..#..........#..',
    '..#..######..#..',
    '..#..........#..',
    '..#..........#..',
    '..############..',
    '................',
    '................',
]);
/** Application diamond, the Mac OS 9 marker for an executable. */
const ApplicationIcon = createPixelIcon('ApplicationIcon', 'Application', [
    '................',
    '.......##.......',
    '......####......',
    '.....######.....',
    '....########....',
    '...##########...',
    '..############..',
    '.##############.',
    '..############..',
    '...##########...',
    '....########....',
    '.....######.....',
    '......####......',
    '.......##.......',
    '................',
    '................',
]);
/** 3.5" floppy disk, the save icon of the era. */
const DiskIcon = createPixelIcon('DiskIcon', 'Disk', [
    '................',
    '.##############.',
    '.#....####....#.',
    '.#....#..#....#.',
    '.#....#..#....#.',
    '.#....#..#....#.',
    '.#....####....#.',
    '.#............#.',
    '.#............#.',
    '.#..########..#.',
    '.#..#......#..#.',
    '.#..#......#..#.',
    '.#..#......#..#.',
    '.##############.',
    '................',
    '................',
]);
/** Hard disk volume, as it appears on the desktop. */
const HardDriveIcon = createPixelIcon('HardDriveIcon', 'Hard disk', [
    '................',
    '................',
    '................',
    '..############..',
    '.#oooooooooooo#.',
    '.#oooooooooooo#.',
    '.#oooooooooooo#.',
    '.#############x.',
    '.#..........#.x.',
    '.#..#####...#.x.',
    '.#..........#.x.',
    '.############.x.',
    '..xxxxxxxxxxxxx.',
    '................',
    '................',
    '................',
]);
/** Picture document. */
const ImageIcon = createPixelIcon('ImageIcon', 'Image', [
    '................',
    '.##############.',
    '.#............#.',
    '.#...##.......#.',
    '.#..#..#......#.',
    '.#..#..#......#.',
    '.#...##.......#.',
    '.#.........#..#.',
    '.#........###.#.',
    '.#...##..######.',
    '.#..####..#####.',
    '.#.######.######',
    '.##############.',
    '................',
    '................',
    '................',
]);
/** Music document. */
const MusicIcon = createPixelIcon('MusicIcon', 'Music', [
    '................',
    '.......########.',
    '.......########.',
    '.......#......#.',
    '.......#......#.',
    '.......#......#.',
    '.......#......#.',
    '.......#......#.',
    '.....###....###.',
    '....#####..#####',
    '....#####..#####',
    '.....###....###.',
    '................',
    '................',
    '................',
    '................',
]);

// Navigation icons - Mac OS 9 React UI
// Directional arrows and wayfinding
/** Solid triangle pointing up. Matches the scrollbar arrows. */
const ArrowUpIcon = createPixelIcon('ArrowUpIcon', 'Up', [
    '................',
    '................',
    '................',
    '.......##.......',
    '......####......',
    '.....######.....',
    '....########....',
    '...##########...',
    '..############..',
    '.##############.',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
]);
/** Solid triangle pointing down. */
const ArrowDownIcon = createPixelIcon('ArrowDownIcon', 'Down', [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '.##############.',
    '..############..',
    '...##########...',
    '....########....',
    '.....######.....',
    '......####......',
    '.......##.......',
    '................',
    '................',
    '................',
]);
/** Solid triangle pointing left. */
const ArrowLeftIcon = createPixelIcon('ArrowLeftIcon', 'Left', [
    '................',
    '.........#......',
    '........##......',
    '.......###......',
    '......####......',
    '.....#####......',
    '....######......',
    '...#######......',
    '....######......',
    '.....#####......',
    '......####......',
    '.......###......',
    '........##......',
    '.........#......',
    '................',
    '................',
]);
/** Solid triangle pointing right. */
const ArrowRightIcon = createPixelIcon('ArrowRightIcon', 'Right', [
    '................',
    '......#.........',
    '......##........',
    '......###.......',
    '......####......',
    '......#####.....',
    '......######....',
    '......#######...',
    '......######....',
    '......#####.....',
    '......####......',
    '......###.......',
    '......##........',
    '......#.........',
    '................',
    '................',
]);
/** House, for a home or root destination. */
const HomeIcon = createPixelIcon('HomeIcon', 'Home', [
    '................',
    '.......##.......',
    '......####......',
    '.....######.....',
    '....########....',
    '...##########...',
    '..############..',
    '.##############.',
    '...##########...',
    '...#........#...',
    '...#..####..#...',
    '...#..#..#..#...',
    '...#..#..#..#...',
    '...##########...',
    '................',
    '................',
]);

// Media icons - Mac OS 9 React UI
// Playback transport and volume
/** Play triangle. */
const PlayIcon = createPixelIcon('PlayIcon', 'Play', [
    '................',
    '................',
    '....#...........',
    '....##..........',
    '....###.........',
    '....####........',
    '....#####.......',
    '....######......',
    '....######......',
    '....#####.......',
    '....####........',
    '....###.........',
    '....##..........',
    '....#...........',
    '................',
    '................',
]);
/** Pause bars. */
const PauseIcon = createPixelIcon('PauseIcon', 'Pause', [
    '................',
    '................',
    '...###....###...',
    '...###....###...',
    '...###....###...',
    '...###....###...',
    '...###....###...',
    '...###....###...',
    '...###....###...',
    '...###....###...',
    '...###....###...',
    '...###....###...',
    '...###....###...',
    '................',
    '................',
    '................',
]);
/** Stop square. */
const StopIcon = createPixelIcon('StopIcon', 'Stop', [
    '................',
    '................',
    '...##########...',
    '...##########...',
    '...##########...',
    '...##########...',
    '...##########...',
    '...##########...',
    '...##########...',
    '...##########...',
    '...##########...',
    '...##########...',
    '................',
    '................',
    '................',
    '................',
]);
/** Speaker with sound waves. */
const VolumeIcon = createPixelIcon('VolumeIcon', 'Volume', [
    '................',
    '................',
    '.......##.......',
    '......###...#...',
    '.....####.#..#..',
    '..#######.#.#.#.',
    '..#######.#.#.#.',
    '..#######.#.#.#.',
    '..#######.#.#.#.',
    '.....####.#..#..',
    '......###...#...',
    '.......##.......',
    '................',
    '................',
    '................',
    '................',
]);
/** Speaker with mute cross. */
const VolumeMuteIcon = createPixelIcon('VolumeMuteIcon', 'Muted', [
    '................',
    '................',
    '.......##.......',
    '......###.......',
    '.....####.#...#.',
    '..#######..#.#..',
    '..#######...#...',
    '..#######..#.#..',
    '..#######.#...#.',
    '.....####.......',
    '......###.......',
    '.......##.......',
    '................',
    '................',
    '................',
    '................',
]);

// Status icons - Mac OS 9 React UI
// Alerts, confirmations, and system state
/** Caution triangle, as used by Mac OS 9 caution alerts. */
const AlertIcon = createPixelIcon('AlertIcon', 'Warning', [
    '................',
    '.......##.......',
    '.......##.......',
    '......####......',
    '......#..#......',
    '.....##..##.....',
    '.....#.##.#.....',
    '....##.##.##....',
    '....#..##..#....',
    '...##..##..##...',
    '...#...##...#...',
    '..##........##..',
    '..#....##....#..',
    '..############..',
    '................',
    '................',
]);
/** Note alert. */
const InfoIcon = createPixelIcon('InfoIcon', 'Information', [
    '................',
    '.....######.....',
    '...##......##...',
    '..#....##....#..',
    '..#....##....#..',
    '.#............#.',
    '.#....####....#.',
    '.#......##....#.',
    '.#......##....#.',
    '.#......##....#.',
    '..#....####..#..',
    '..#..........#..',
    '...##......##...',
    '.....######.....',
    '................',
    '................',
]);
/** Stop alert. */
const ErrorIcon = createPixelIcon('ErrorIcon', 'Error', [
    '................',
    '.....######.....',
    '...##......##...',
    '..#..#....#..#..',
    '..#..##..##..#..',
    '.#....####....#.',
    '.#.....##.....#.',
    '.#....####....#.',
    '.#...##..##...#.',
    '.#..##....##..#.',
    '..#..........#..',
    '..#..........#..',
    '...##......##...',
    '.....######.....',
    '................',
    '................',
]);
/** Checkmark, for menu items and confirmations. */
const CheckIcon = createPixelIcon('CheckIcon', 'Checked', [
    '................',
    '................',
    '.............##.',
    '............##..',
    '...........##...',
    '..........##....',
    '.##......##.....',
    '..##....##......',
    '...##..##.......',
    '....####........',
    '.....##.........',
    '................',
    '................',
    '................',
    '................',
    '................',
]);
/** Question alert. */
const QuestionIcon = createPixelIcon('QuestionIcon', 'Question', [
    '................',
    '.....######.....',
    '...##......##...',
    '..#...####...#..',
    '..#..##..##..#..',
    '.#........##..#.',
    '.#.......##...#.',
    '.#......##....#.',
    '.#......##....#.',
    '.#............#.',
    '..#.....##...#..',
    '..#.....##...#..',
    '...##......##...',
    '.....######.....',
    '................',
    '................',
]);

/**
 * Divider icon
 * Vertical divider for menu bars and toolbars
 * Note: Uses a 10x32 viewBox instead of standard 24x24
 */
const DividerIcon = ({ label = 'Divider', ...props }) => (jsxRuntime.jsxs(Icon, { label: label === null ? undefined : label, size: "sm", viewBox: "0 0 10 32", ...props, children: [jsxRuntime.jsxs("g", { clipPath: "url(#clip0_529_36832)", children: [jsxRuntime.jsx("path", { d: "M8 4H10V32H8V4Z", fill: "#999999" }), jsxRuntime.jsx("path", { d: "M8 0H10V4H8V0Z", fill: "#999999" }), jsxRuntime.jsx("path", { d: "M0 4H2V32H0V4Z", fill: "white" }), jsxRuntime.jsx("path", { d: "M0 0H2V4H0V0Z", fill: "white" }), jsxRuntime.jsx("path", { d: "M5 28H7V30H5V28Z", fill: "#BBBBBB" }), jsxRuntime.jsx("path", { d: "M5 21H7V23H5V21Z", fill: "#BBBBBB" }), jsxRuntime.jsx("path", { d: "M5 14H7V16H5V14Z", fill: "#BBBBBB" }), jsxRuntime.jsx("path", { d: "M5 7H7V9H5V7Z", fill: "#BBBBBB" }), jsxRuntime.jsx("path", { d: "M5 4H7V2H5V4Z", fill: "#BBBBBB" }), jsxRuntime.jsx("path", { d: "M5 30H7V32H5V30Z", fill: "white" }), jsxRuntime.jsx("path", { d: "M5 23H7V25H5V23Z", fill: "white" }), jsxRuntime.jsx("path", { d: "M5 16H7V18H5V16Z", fill: "white" }), jsxRuntime.jsx("path", { d: "M5 9H7V11H5V9Z", fill: "white" }), jsxRuntime.jsx("path", { d: "M5 2H7V0H5V2Z", fill: "white" }), jsxRuntime.jsx("path", { d: "M3 28H5V30H3V28Z", fill: "#999999" }), jsxRuntime.jsx("path", { d: "M3 21H5V23H3V21Z", fill: "#999999" }), jsxRuntime.jsx("path", { d: "M3 14H5V16H3V14Z", fill: "#999999" }), jsxRuntime.jsx("path", { d: "M3 7H5V9H3V7Z", fill: "#999999" }), jsxRuntime.jsx("path", { d: "M3 4H5V2H3V4Z", fill: "#999999" }), jsxRuntime.jsx("path", { d: "M3 30H5V32H3V30Z", fill: "#BBBBBB" }), jsxRuntime.jsx("path", { d: "M3 23H5V25H3V23Z", fill: "#BBBBBB" }), jsxRuntime.jsx("path", { d: "M3 16H5V18H3V16Z", fill: "#BBBBBB" }), jsxRuntime.jsx("path", { d: "M3 9H5V11H3V9Z", fill: "#BBBBBB" }), jsxRuntime.jsx("path", { d: "M3 2H5V0H3V2Z", fill: "#BBBBBB" })] }), jsxRuntime.jsx("defs", { children: jsxRuntime.jsx("clipPath", { id: "clip0_529_36832", children: jsxRuntime.jsx("rect", { width: "10", height: "32", fill: "white" }) }) })] }));
/** Bevelled grow box, matching the Window resize handle. */
const ResizeHandleIcon = createPixelIcon('ResizeHandleIcon', 'Resize', [
    '................',
    '................',
    '................',
    '................',
    '............##..',
    '............##..',
    '................',
    '........##..##..',
    '........##..##..',
    '................',
    '....##..##..##..',
    '....##..##..##..',
    '................',
    '................',
    '................',
    '................',
]);
/** Textured drag grip, for title bars and splitters. */
const GrabberIcon = createPixelIcon('GrabberIcon', 'Drag handle', [
    '................',
    '................',
    '..##..##..##..#.',
    '..oo..oo..oo..o.',
    '................',
    '..##..##..##..#.',
    '..oo..oo..oo..o.',
    '................',
    '..##..##..##..#.',
    '..oo..oo..oo..o.',
    '................',
    '..##..##..##..#.',
    '..oo..oo..oo..o.',
    '................',
    '................',
    '................',
]);
/** Small disclosure triangle, pointing right (collapsed). */
const ChevronRightIcon = createPixelIcon('ChevronRightIcon', 'Expand', [
    '................',
    '................',
    '................',
    '......#.........',
    '......##........',
    '......###.......',
    '......####......',
    '......#####.....',
    '......####......',
    '......###.......',
    '......##........',
    '......#.........',
    '................',
    '................',
    '................',
    '................',
]);
/** Small disclosure triangle, pointing down (expanded). */
const ChevronDownIcon = createPixelIcon('ChevronDownIcon', 'Collapse', [
    '................',
    '................',
    '................',
    '................',
    '................',
    '...##########...',
    '....########....',
    '.....######.....',
    '......####......',
    '.......##.......',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
]);
/** Head and shoulders. */
const UserIcon = createPixelIcon('UserIcon', 'User', [
    '................',
    '................',
    '......####......',
    '.....##..##.....',
    '.....#....#.....',
    '.....##..##.....',
    '......####......',
    '................',
    '....########....',
    '...##......##...',
    '..##........##..',
    '..#..........#..',
    '..#..........#..',
    '..#..........#..',
    '................',
    '................',
]);
/** Closed padlock. */
const LockIcon = createPixelIcon('LockIcon', 'Locked', [
    '................',
    '......####......',
    '.....##..##.....',
    '....##....##....',
    '....#......#....',
    '....#......#....',
    '..############..',
    '..#..........#..',
    '..#....##....#..',
    '..#....##....#..',
    '..#...####...#..',
    '..#....##....#..',
    '..############..',
    '................',
    '................',
    '................',
]);
/** Wall calendar. */
const CalendarIcon = createPixelIcon('CalendarIcon', 'Calendar', [
    '................',
    '...##......##...',
    '...##......##...',
    '.##############.',
    '.##############.',
    '.#............#.',
    '.#.##.##.##...#.',
    '.#............#.',
    '.#.##.##.##...#.',
    '.#............#.',
    '.#.##.##.##...#.',
    '.#............#.',
    '.##############.',
    '................',
    '................',
    '................',
]);

// Icon Registry - Mac OS 9 React UI
// Central registry of all available icons with type-safe names
/**
 * Central icon registry
 * Maps icon names to their components
 */
const iconRegistry = {
    // Actions
    close: CloseIcon,
    trash: TrashIcon,
    search: SearchIcon,
    copy: CopyIcon,
    print: PrintIcon,
    download: DownloadIcon,
    link: LinkIcon,
    mail: MailIcon,
    // Files
    folder: FolderIcon,
    folderOpen: FolderOpenIcon,
    document: DocumentIcon,
    application: ApplicationIcon,
    disk: DiskIcon,
    hardDrive: HardDriveIcon,
    image: ImageIcon,
    music: MusicIcon,
    // Navigation
    arrowUp: ArrowUpIcon,
    arrowDown: ArrowDownIcon,
    arrowLeft: ArrowLeftIcon,
    arrowRight: ArrowRightIcon,
    home: HomeIcon,
    // Media
    play: PlayIcon,
    pause: PauseIcon,
    stop: StopIcon,
    volume: VolumeIcon,
    volumeMute: VolumeMuteIcon,
    // Status
    alert: AlertIcon,
    info: InfoIcon,
    error: ErrorIcon,
    check: CheckIcon,
    question: QuestionIcon,
    // UI
    divider: DividerIcon,
    resizeHandle: ResizeHandleIcon,
    grabber: GrabberIcon,
    chevronRight: ChevronRightIcon,
    chevronDown: ChevronDownIcon,
    user: UserIcon,
    lock: LockIcon,
    calendar: CalendarIcon,
};
/**
 * Get icon component by name
 * @param name - The icon name from the registry
 * @returns The icon component
 */
function getIcon(name) {
    return iconRegistry[name];
}
/**
 * Check if an icon exists in the registry
 * @param name - The icon name to check
 * @returns True if the icon exists
 */
function hasIcon(name) {
    return name in iconRegistry;
}
/**
 * Get all available icon names
 * @returns Array of all icon names
 */
function getAllIconNames() {
    return Object.keys(iconRegistry);
}

/**
 * IconLibrary component for Mac OS 9 UI
 *
 * Provides a convenient way to use icons by name rather than importing each
 * one individually. All icons are registered in the icon registry and can be
 * accessed by their string names; `IconName` is derived from the registry, so
 * an unknown name is a compile error rather than a blank space.
 *
 * Use {@link getAllIconNames} to enumerate what is available.
 *
 * @example
 * ```tsx
 * <IconLibrary icon="folder" size="lg" />
 * <IconLibrary icon="arrowRight" size="sm" />
 * <IconLibrary icon="trash" label="Move to Trash" />
 * ```
 */
const IconLibrary = ({ icon, ...props }) => {
    const IconComponent = getIcon(icon);
    if (!IconComponent) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`IconLibrary: no icon named "${icon}" in the registry.`);
        }
        return null;
    }
    // Render the icon component with any additional props
    return jsxRuntime.jsx(IconComponent, { ...props });
};
IconLibrary.displayName = 'IconLibrary';

// Development-only deprecation warnings.
//
// The 1.0 API renames several props (camelCase ARIA → hyphenated, onChange →
// onValueChange, errorMessage → error, and so on). The old names still work
// for one major version, but silently accepting them would leave consumers
// unaware they are on a removal path — so each use warns once in development
// and costs nothing in production.
/** Names already warned about, so a re-rendering component warns only once. */
const warned = new Set();
/**
 * Warn that `oldName` is deprecated in favour of `newName`.
 *
 * No-ops in production builds and after the first warning for a given pair.
 *
 * @param component - Component the prop belongs to, e.g. 'Button'
 * @param oldName - The deprecated prop name
 * @param newName - The replacement prop name
 */
function warnDeprecatedProp(component, oldName, newName) {
    if (process.env.NODE_ENV === 'production')
        return;
    const key = `${component}.${oldName}`;
    if (warned.has(key))
        return;
    warned.add(key);
    console.warn(`[mac-os9-ui] ${component}: \`${oldName}\` is deprecated and will be removed in 2.0. ` +
        `Use \`${newName}\` instead.`);
}
/**
 * Warn about a missing prop that the component needs to behave correctly.
 *
 * Used where a silently-wrong default is worse than a loud complaint, e.g.
 * an icon-only button with no accessible name (issue #123) or a Scrollbar
 * with no real viewport ratio (issue #122).
 *
 * @param component - Component reporting the problem
 * @param message - What is wrong and how to fix it
 */
function warnMissingProp(component, message) {
    if (process.env.NODE_ENV === 'production')
        return;
    const key = `${component}:${message}`;
    if (warned.has(key))
        return;
    warned.add(key);
    console.warn(`[mac-os9-ui] ${component}: ${message}`);
}

var styles$c = {"pixelated-corner-sm":"IconButton-module_pixelated-corner-sm","pixelated-corner-md":"IconButton-module_pixelated-corner-md","pixelated-corner-pseudo":"IconButton-module_pixelated-corner-pseudo","mac-corner":"IconButton-module_mac-corner","chamfered-sm":"IconButton-module_chamfered-sm","chamfered-md":"IconButton-module_chamfered-md","tab-corner":"IconButton-module_tab-corner","button-corner":"IconButton-module_button-corner","window-corner":"IconButton-module_window-corner","iconButton":"IconButton-module_iconButton","icon":"IconButton-module_icon","label":"IconButton-module_label","iconButton--label-top":"IconButton-module_iconButton--label-top","iconButton--label-bottom":"IconButton-module_iconButton--label-bottom","iconButton--label-left":"IconButton-module_iconButton--label-left","iconButton--label-right":"IconButton-module_iconButton--label-right","iconButton--sm":"IconButton-module_iconButton--sm","iconButton--with-label":"IconButton-module_iconButton--with-label","iconButton--md":"IconButton-module_iconButton--md","iconButton--lg":"IconButton-module_iconButton--lg","iconButton--default":"IconButton-module_iconButton--default","iconButton--primary":"IconButton-module_iconButton--primary","iconButton--danger":"IconButton-module_iconButton--danger","iconButton--disabled":"IconButton-module_iconButton--disabled"};

/**
 * An icon with no visible label has no accessible name, so a screen reader
 * announces it as just "button". Warn in development rather than shipping one.
 */
function assertHasName(label, ariaLabel, title) {
    if (label || ariaLabel || title)
        return;
    warnMissingProp('IconButton', 'no accessible name. Pass `label`, `aria-label`, or `title` — an icon alone announces as "button".');
}
/**
 * IconButton component for Mac OS 9 UI
 *
 * Button with an icon, optionally with a text label.
 * Supports all button variants and sizes.
 *
 * @example
 * ```tsx
 * // Icon-only button
 * <IconButton icon={<SaveIcon />} />
 *
 * // Icon with label
 * <IconButton
 *   icon={<FolderIcon />}
 *   label="New Folder"
 *   variant="primary"
 * />
 *
 * // Icon with label on different sides
 * <IconButton
 *   icon={<SearchIcon />}
 *   label="Search"
 *   labelPosition="right"
 * />
 * ```
 */
const IconButton = React.forwardRef(({ icon, label, labelPosition = 'right', variant = 'default', size = 'md', disabled = false, className = '', ...props }, ref) => {
    if (process.env.NODE_ENV !== 'production') {
        assertHasName(label, props['aria-label'], props.title);
    }
    // Build class names
    const classNames = mergeClasses(styles$c.iconButton, styles$c[`iconButton--${variant}`], styles$c[`iconButton--${size}`], label && styles$c['iconButton--with-label'], label && styles$c[`iconButton--label-${labelPosition}`], disabled && styles$c['iconButton--disabled'], className);
    return (jsxRuntime.jsxs("button", { ref: ref, type: "button", className: classNames, disabled: disabled, ...props, children: [label && (labelPosition === 'left' || labelPosition === 'top') && (jsxRuntime.jsx("span", { className: styles$c.label, children: label })), jsxRuntime.jsx("span", { className: styles$c.icon, children: icon }), label && (labelPosition === 'right' || labelPosition === 'bottom') && (jsxRuntime.jsx("span", { className: styles$c.label, children: label }))] }));
});
IconButton.displayName = 'IconButton';

// Resolving the standard aria-* props against their deprecated camelCase aliases.
//
// The library originally exposed `ariaLabel`, `ariaLabelledBy`,
// `ariaDescribedBy` and `ariaPressed` instead of the attributes React already
// understands. That meant consumers had to learn a second spelling for
// something standard, and a component spreading `...props` could receive both
// forms with no defined precedence.
//
// Every component now accepts the standard attribute. The camelCase names
// still work — they were public API — but they warn once in development and
// lose to the standard form when both are given.
/**
 * Picks between a standard `aria-*` prop and its deprecated camelCase alias.
 *
 * @param component - Component name, for the warning
 * @param standardName - e.g. `'aria-label'`
 * @param legacyName - e.g. `'ariaLabel'`
 * @param standard - Value of the standard prop
 * @param legacy - Value of the deprecated prop
 * @returns The standard value when present, otherwise the legacy one
 */
function resolveAria(component, standardName, legacyName, standard, legacy) {
    if (legacy !== undefined) {
        warnDeprecatedProp(component, legacyName, standardName);
    }
    return standard ?? legacy;
}

/**
 * Renders the helper and error text for a form control.
 *
 * Returns `null` when the control has neither, so a field that never uses them
 * costs nothing.
 */
function FieldMessage({ helperId, errorId, error, errorMessage, helperText, errorLiveRegion = 'polite', helperClassName, errorClassName, }) {
    const showError = Boolean(error && errorMessage);
    // Nothing to render, and nothing to keep mounted for announcements.
    if (!helperText && !errorMessage)
        return null;
    return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [helperText && !error ? (jsxRuntime.jsx("p", { id: helperId, className: mergeClasses(helperClassName), children: helperText })) : null, errorMessage ? (jsxRuntime.jsx("p", { id: errorId, className: mergeClasses(errorClassName), role: errorLiveRegion === 'off' ? undefined : 'status', "aria-live": errorLiveRegion === 'off' ? undefined : errorLiveRegion, hidden: !showError, children: showError ? errorMessage : null })) : null] }));
}
/**
 * Builds the `aria-describedby` value for a control, merging the ids this
 * component owns with whatever the caller supplied.
 */
function describedBy(options) {
    const ids = [
        options.helperText && !options.error ? options.helperId : undefined,
        options.error && options.errorMessage ? options.errorId : undefined,
        options.callerDescribedBy,
    ].filter(Boolean);
    return ids.length > 0 ? ids.join(' ') : undefined;
}

var styles$b = {"wrapper":"Checkbox-module_wrapper","wrapper--disabled":"Checkbox-module_wrapper--disabled","wrapper--error":"Checkbox-module_wrapper--error","wrapper--label-left":"Checkbox-module_wrapper--label-left","wrapper--label-right":"Checkbox-module_wrapper--label-right","checkbox":"Checkbox-module_checkbox","checkbox--sm":"Checkbox-module_checkbox--sm","checkbox--md":"Checkbox-module_checkbox--md","checkbox--lg":"Checkbox-module_checkbox--lg","checkbox--indeterminate":"Checkbox-module_checkbox--indeterminate","checkbox--error":"Checkbox-module_checkbox--error","label":"Checkbox-module_label","label--sm":"Checkbox-module_label--sm","label--md":"Checkbox-module_label--md","label--lg":"Checkbox-module_label--lg","wrapper--sm":"Checkbox-module_wrapper--sm","wrapper--md":"Checkbox-module_wrapper--md","wrapper--lg":"Checkbox-module_wrapper--lg","helper-text":"Checkbox-module_helper-text","error-message":"Checkbox-module_error-message"};

/**
 * Mac OS 9 style Checkbox component
 *
 * Classic checkbox with raised bevel effect and optional label.
 * Supports checked, unchecked, indeterminate, and disabled states.
 *
 * Features:
 * - Classic Mac OS 9 bevel styling
 * - Indeterminate state support
 * - Label positioning (left/right)
 * - Controlled and uncontrolled modes
 * - Full accessibility with ARIA support
 * - Keyboard navigation (Space to toggle)
 * - Form integration
 *
 * @example
 * ```tsx
 * // Uncontrolled
 * <Checkbox label="Accept terms" />
 *
 * // Controlled
 * <Checkbox
 *   checked={isChecked}
 *   onChange={(e) => setIsChecked(e.target.checked)}
 *   label="Subscribe to newsletter"
 * />
 *
 * // Indeterminate (for "select all")
 * <Checkbox
 *   indeterminate={someSelected && !allSelected}
 *   checked={allSelected}
 *   onChange={handleSelectAll}
 *   label="Select all items"
 * />
 * ```
 */
const Checkbox = React.forwardRef(({ checked, defaultChecked, indeterminate = false, disabled = false, label, labelPosition = 'right', size = 'md', error = false, errorMessage, helperText, errorLiveRegion = 'polite', ariaLabel, ariaDescribedBy, 'aria-label': ariaLabelAttr, 'aria-describedby': ariaDescribedByAttr, className = '', onChange, id, ...props }, ref) => {
    const inputRef = React.useRef(null);
    const combinedRef = ref || inputRef;
    // Set indeterminate property via ref (can't be set via HTML attribute)
    React.useEffect(() => {
        if (combinedRef?.current) {
            combinedRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate, combinedRef]);
    // Generate ID if not provided (for label association)
    // useId must be called unconditionally — see the note in TextField.
    const generatedId = React.useId();
    const checkboxId = id ?? generatedId;
    // Build class names
    const wrapperClassNames = mergeClasses(styles$b.wrapper, styles$b[`wrapper--${size}`], styles$b[`wrapper--label-${labelPosition}`], disabled && styles$b['wrapper--disabled'], error && styles$b['wrapper--error'], className);
    const checkboxClassNames = mergeClasses(styles$b.checkbox, styles$b[`checkbox--${size}`], indeterminate && styles$b['checkbox--indeterminate'], error && styles$b['checkbox--error']);
    const labelClassNames = mergeClasses(styles$b.label, styles$b[`label--${size}`]);
    // ARIA attributes
    //
    // Note: we deliberately do NOT set `aria-checked`. Per ARIA 1.2,
    // `aria-checked` cannot be used on a native <input type="checkbox">
    // — the host language already exposes the checked state. The
    // tri-state ("mixed") indicator is the DOM `indeterminate` property,
    // which the effect above sets on the input via ref.
    // Standard attributes win; the camelCase aliases warn once in development.
    const resolvedLabel = resolveAria('Checkbox', 'aria-label', 'ariaLabel', ariaLabelAttr, ariaLabel);
    const resolvedDescribedBy = resolveAria('Checkbox', 'aria-describedby', 'ariaDescribedBy', ariaDescribedByAttr, ariaDescribedBy);
    const helperId = `${checkboxId}-helper`;
    const errorId = `${checkboxId}-error`;
    const ariaAttributes = {
        'aria-label': !label ? resolvedLabel : undefined,
        'aria-describedby': describedBy({
            helperId,
            errorId,
            helperText,
            error,
            errorMessage,
            callerDescribedBy: resolvedDescribedBy,
        }),
        'aria-invalid': error,
    };
    return (jsxRuntime.jsxs("div", { className: wrapperClassNames, children: [label && labelPosition === 'left' && (jsxRuntime.jsx("label", { htmlFor: checkboxId, className: labelClassNames, children: label })), jsxRuntime.jsx("input", { ref: combinedRef, type: "checkbox", id: checkboxId, className: checkboxClassNames, checked: checked, defaultChecked: defaultChecked, disabled: disabled, onChange: onChange, ...ariaAttributes, ...props }), label && labelPosition === 'right' && (jsxRuntime.jsx("label", { htmlFor: checkboxId, className: labelClassNames, children: label })), jsxRuntime.jsx(FieldMessage, { helperId: helperId, errorId: errorId, error: error, errorMessage: errorMessage, helperText: helperText, errorLiveRegion: errorLiveRegion, helperClassName: styles$b['helper-text'], errorClassName: styles$b['error-message'] })] }));
});
Checkbox.displayName = 'Checkbox';

var styles$a = {"wrapper":"Radio-module_wrapper","wrapper--disabled":"Radio-module_wrapper--disabled","wrapper--error":"Radio-module_wrapper--error","wrapper--label-left":"Radio-module_wrapper--label-left","wrapper--label-right":"Radio-module_wrapper--label-right","radio":"Radio-module_radio","radio--sm":"Radio-module_radio--sm","radio--md":"Radio-module_radio--md","radio--lg":"Radio-module_radio--lg","radio--error":"Radio-module_radio--error","label":"Radio-module_label","label--sm":"Radio-module_label--sm","label--md":"Radio-module_label--md","label--lg":"Radio-module_label--lg","wrapper--sm":"Radio-module_wrapper--sm","wrapper--md":"Radio-module_wrapper--md","wrapper--lg":"Radio-module_wrapper--lg","radioGroup":"Radio-module_radioGroup","radioGroup--vertical":"Radio-module_radioGroup--vertical","radioGroup--horizontal":"Radio-module_radioGroup--horizontal","helper-text":"Radio-module_helper-text","error-message":"Radio-module_error-message"};

const RadioGroupContext = React.createContext(null);
/**
 * Mac OS 9 style Radio component
 *
 * Classic radio button with raised bevel effect and optional label. For
 * groups of radio buttons, prefer wrapping siblings in <RadioGroup>: that
 * adds the required ARIA semantics, arrow-key navigation, and ensures
 * single-selection enforcement across the group.
 *
 * @example
 * ```tsx
 * // Recommended: with RadioGroup
 * <RadioGroup name="size" value={size} onValueChange={setSize}>
 *   <Radio value="small" label="Small" />
 *   <Radio value="medium" label="Medium" />
 *   <Radio value="large" label="Large" />
 * </RadioGroup>
 *
 * // Standalone (legacy) still works
 * <Radio name="color" value="red" label="Red" />
 * ```
 */
const Radio = React.forwardRef(({ checked, defaultChecked, disabled = false, label, labelPosition = 'right', size = 'md', error = false, errorMessage, helperText, errorLiveRegion = 'polite', ariaLabel, ariaDescribedBy, 'aria-label': ariaLabelAttr, 'aria-describedby': ariaDescribedByAttr, className = '', value, name, onChange, id, ...props }, ref) => {
    // When wrapped by <RadioGroup>, inherit name / value / onChange / disabled
    // from context. Standalone Radios fall back to their own props.
    const group = React.useContext(RadioGroupContext);
    const resolvedName = group?.name ?? name;
    const resolvedDisabled = disabled || group?.disabled || false;
    const resolvedChecked = group ? group.value !== undefined && group.value === value : checked;
    const handleInputChange = (event) => {
        if (group?.onChange && value !== undefined)
            group.onChange(value, event);
        onChange?.(event);
    };
    // Generate ID if not provided (for label association)
    const generatedId = React.useId();
    const radioId = id || generatedId;
    // Build class names
    const wrapperClassNames = mergeClasses(styles$a.wrapper, styles$a[`wrapper--${size}`], styles$a[`wrapper--label-${labelPosition}`], resolvedDisabled && styles$a['wrapper--disabled'], error && styles$a['wrapper--error'], className);
    const radioClassNames = mergeClasses(styles$a.radio, styles$a[`radio--${size}`], error && styles$a['radio--error']);
    const labelClassNames = mergeClasses(styles$a.label, styles$a[`label--${size}`]);
    // ARIA attributes
    const helperId = `${radioId}-helper`;
    const errorId = `${radioId}-error`;
    // Standard attributes win; the camelCase aliases warn once in development.
    const ariaAttributes = {
        'aria-label': !label
            ? resolveAria('Radio', 'aria-label', 'ariaLabel', ariaLabelAttr, ariaLabel)
            : undefined,
        'aria-describedby': describedBy({
            helperId,
            errorId,
            helperText,
            error,
            errorMessage,
            callerDescribedBy: resolveAria('Radio', 'aria-describedby', 'ariaDescribedBy', ariaDescribedByAttr, ariaDescribedBy),
        }),
        'aria-invalid': error,
    };
    return (jsxRuntime.jsxs("div", { className: wrapperClassNames, children: [label && labelPosition === 'left' && (jsxRuntime.jsx("label", { htmlFor: radioId, className: labelClassNames, children: label })), jsxRuntime.jsx("input", { ref: ref, type: "radio", id: radioId, className: radioClassNames, checked: group ? resolvedChecked : checked, defaultChecked: group ? undefined : defaultChecked, disabled: resolvedDisabled, value: value, name: resolvedName, onChange: handleInputChange, ...ariaAttributes, ...props }), label && labelPosition === 'right' && (jsxRuntime.jsx("label", { htmlFor: radioId, className: labelClassNames, children: label })), jsxRuntime.jsx(FieldMessage, { helperId: helperId, errorId: errorId, error: error, errorMessage: errorMessage, helperText: helperText, errorLiveRegion: errorLiveRegion, helperClassName: styles$a['helper-text'], errorClassName: styles$a['error-message'] })] }));
});
Radio.displayName = 'Radio';
/**
 * Container for a set of <Radio> options. Adds the required
 * WAI-ARIA radiogroup semantics, arrow-key navigation between options,
 * and a single-selection model.
 *
 * @example
 * ```tsx
 * const [size, setSize] = useState('medium');
 * <RadioGroup name="size" value={size} onValueChange={setSize} aria-label="T-shirt size">
 *   <Radio value="small" label="Small" />
 *   <Radio value="medium" label="Medium" />
 *   <Radio value="large" label="Large" />
 * </RadioGroup>
 * ```
 */
const RadioGroupImpl = React.forwardRef(({ name, value, defaultValue, onChange, onValueChange, disabled = false, orientation = 'vertical', ariaLabel, ariaLabelledBy, 'aria-label': ariaLabelAttr, 'aria-labelledby': ariaLabelledByAttr, className = '', children, }, ref) => {
    const generatedName = React.useId();
    const resolvedName = name ?? `radio-group-${generatedName}`;
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const currentValue = isControlled ? value : internalValue;
    // `onValueChange` is the supported name; `onChange` still works and
    // warns once in development.
    if (process.env.NODE_ENV !== 'production' && onChange && !onValueChange) {
        warnDeprecatedProp('RadioGroup', 'onChange', 'onValueChange');
    }
    const handleChildChange = React.useCallback((nextValue) => {
        if (!isControlled)
            setInternalValue(nextValue);
        (onValueChange ?? onChange)?.(nextValue);
    }, [isControlled, onValueChange, onChange]);
    // Arrow-key navigation. We scope the listener to the group root and
    // query enabled radios on demand so consumers can render any structure
    // inside (Radio wrapped in extra divs is fine).
    const groupRef = React.useRef(null);
    const setGroupRef = React.useCallback((node) => {
        groupRef.current = node;
        if (typeof ref === 'function')
            ref(node);
        else if (ref)
            ref.current = node;
    }, [ref]);
    const handleKeyDown = (event) => {
        const isVertical = orientation === 'vertical';
        const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
        const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
        if (event.key !== prevKey && event.key !== nextKey)
            return;
        const root = groupRef.current;
        if (!root)
            return;
        const radios = Array.from(root.querySelectorAll(`input[type="radio"][name="${resolvedName}"]:not(:disabled)`));
        if (radios.length === 0)
            return;
        event.preventDefault();
        const activeIndex = radios.findIndex((r) => r === document.activeElement);
        const direction = event.key === nextKey ? 1 : -1;
        // If nothing in the group is focused yet, start from the currently
        // selected radio (or the first one if there's no selection).
        const startIndex = activeIndex >= 0
            ? activeIndex
            : Math.max(0, radios.findIndex((r) => r.value === String(currentValue)));
        const nextIndex = (startIndex + direction + radios.length) % radios.length;
        const target = radios[nextIndex];
        if (!target)
            return;
        target.focus();
        // Report the change through the group's own handler rather than
        // mutating `target.checked` and dispatching a native `change`.
        //
        // React does not derive a radio's onChange from a native change
        // event — it detects the change from a click — so the dispatched
        // event notified nobody, while the imperative `checked = true`
        // desynced the DOM from React's controlled value until the next
        // render put it back. Arrow-key selection simply did not reach the
        // consumer.
        //
        // Selecting on move is the WAI-ARIA radiogroup pattern for
        // automatic activation, which is what this implements.
        handleChildChange(target.value);
    };
    const contextValue = {
        name: resolvedName,
        value: currentValue,
        disabled,
        onChange: (nextValue) => handleChildChange(nextValue),
    };
    return (jsxRuntime.jsx("div", { ref: setGroupRef, role: "radiogroup", "aria-label": resolveAria('RadioGroup', 'aria-label', 'ariaLabel', ariaLabelAttr, ariaLabel), "aria-labelledby": resolveAria('RadioGroup', 'aria-labelledby', 'ariaLabelledBy', ariaLabelledByAttr, ariaLabelledBy), "aria-orientation": orientation, "aria-disabled": disabled || undefined, onKeyDown: handleKeyDown, className: mergeClasses(styles$a.radioGroup, styles$a[`radioGroup--${orientation}`], className), children: jsxRuntime.jsx(RadioGroupContext.Provider, { value: contextValue, children: children }) }));
});
RadioGroupImpl.displayName = 'RadioGroup';
/**
 * `forwardRef` erases generics, so the forwarded component is re-cast to a
 * signature that keeps `TValue` — matching Select, Tabs and ListView.
 */
const RadioGroup = RadioGroupImpl;

var styles$9 = {"wrapper":"TextField-module_wrapper","wrapper--full-width":"TextField-module_wrapper--full-width","wrapper--disabled":"TextField-module_wrapper--disabled","wrapper--label-top":"TextField-module_wrapper--label-top","wrapper--label-left":"TextField-module_wrapper--label-left","wrapper--label-right":"TextField-module_wrapper--label-right","label":"TextField-module_label","label--sm":"TextField-module_label--sm","label--md":"TextField-module_label--md","label--lg":"TextField-module_label--lg","input-wrapper":"TextField-module_input-wrapper","input":"TextField-module_input","input--sm":"TextField-module_input--sm","input--md":"TextField-module_input--md","input--lg":"TextField-module_input--lg","input--full-width":"TextField-module_input--full-width","input-icon-left":"TextField-module_input-icon-left","input-icon-right":"TextField-module_input-icon-right","input-wrapper--with-left-icon":"TextField-module_input-wrapper--with-left-icon","input-wrapper--with-right-icon":"TextField-module_input-wrapper--with-right-icon","input--error":"TextField-module_input--error","helper-text":"TextField-module_helper-text","error-message":"TextField-module_error-message","wrapper--sm":"TextField-module_wrapper--sm","wrapper--md":"TextField-module_wrapper--md","wrapper--lg":"TextField-module_wrapper--lg"};

/**
 * Mac OS 9 style TextField component
 *
 * Classic text input with inset bevel effect and optional label.
 *
 * Features:
 * - Classic Mac OS 9 inset bevel styling
 * - Label positioning (top/left/right)
 * - Size variants (sm/md/lg)
 * - Error states with messages
 * - Helper text support
 * - Icon support (left/right)
 * - Full accessibility with ARIA support
 * - Keyboard navigation
 * - Form integration
 *
 * @example
 * ```tsx
 * // Basic text field
 * <TextField placeholder="Enter text..." />
 *
 * // With label
 * <TextField label="Username" placeholder="Enter username" />
 *
 * // With error
 * <TextField
 *   label="Email"
 *   error
 *   errorMessage="Invalid email address"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 *
 * // With icons
 * <TextField
 *   leftIcon={<SearchIcon />}
 *   placeholder="Search..."
 * />
 * ```
 */
const TextField = React.forwardRef(({ label, labelPosition = 'top', size = 'md', fullWidth = false, error = false, errorMessage, helperText, leftIcon, rightIcon, ariaLabel, ariaDescribedBy, 'aria-label': ariaLabelAttr, 'aria-describedby': ariaDescribedByAttr, className = '', wrapperClassName = '', type = 'text', id, disabled, multiline = false, rows = 3, errorLiveRegion = 'polite', textareaProps, ...props }, ref) => {
    // Generate ID if not provided (for label association)
    // useId must be called unconditionally. Writing `id || React.useId()`
    // short-circuits the hook away whenever `id` is supplied, so the hook
    // order changes if `id` ever goes from defined to undefined.
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    // Standard attributes win; the camelCase aliases warn once in development.
    const resolvedLabel = resolveAria('TextField', 'aria-label', 'ariaLabel', ariaLabelAttr, ariaLabel);
    const resolvedDescribedBy = resolveAria('TextField', 'aria-describedby', 'ariaDescribedBy', ariaDescribedByAttr, ariaDescribedBy);
    // Generate helper/error text ID for aria-describedby
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    // Combine aria-describedby
    const describedByIds = describedBy({
        helperId,
        errorId,
        helperText,
        error,
        errorMessage,
        callerDescribedBy: resolvedDescribedBy,
    });
    // Build class names
    const wrapperClassNames = mergeClasses(styles$9.wrapper, styles$9[`wrapper--${size}`], styles$9[`wrapper--label-${labelPosition}`], fullWidth && styles$9['wrapper--full-width'], disabled && styles$9['wrapper--disabled'], wrapperClassName);
    const inputWrapperClassNames = mergeClasses(styles$9['input-wrapper'], (leftIcon || rightIcon) && styles$9['input-wrapper--with-icon'], leftIcon && styles$9['input-wrapper--with-left-icon'], rightIcon && styles$9['input-wrapper--with-right-icon']);
    const inputClassNames = mergeClasses(styles$9.input, styles$9[`input--${size}`], error && styles$9['input--error'], fullWidth && styles$9['input--full-width'], className);
    const labelClassNames = mergeClasses(styles$9.label, styles$9[`label--${size}`]);
    // ARIA attributes
    const ariaAttributes = {
        'aria-label': !label ? resolvedLabel : undefined,
        'aria-describedby': describedByIds || undefined,
        'aria-invalid': error,
    };
    return (jsxRuntime.jsxs("div", { className: wrapperClassNames, children: [label && (labelPosition === 'top' || labelPosition === 'left') && (jsxRuntime.jsx("label", { htmlFor: inputId, className: labelClassNames, children: label })), jsxRuntime.jsxs("div", { className: inputWrapperClassNames, children: [leftIcon && (jsxRuntime.jsx("span", { className: styles$9['input-icon-left'], "aria-hidden": "true", children: leftIcon })), multiline ? (jsxRuntime.jsx("textarea", { ref: ref, id: inputId, rows: rows, className: inputClassNames, disabled: disabled, ...ariaAttributes, ...props, ...textareaProps })) : (jsxRuntime.jsx("input", { ref: ref, type: type, id: inputId, className: inputClassNames, disabled: disabled, ...ariaAttributes, ...props })), rightIcon && (jsxRuntime.jsx("span", { className: styles$9['input-icon-right'], "aria-hidden": "true", children: rightIcon }))] }), label && labelPosition === 'right' && (jsxRuntime.jsx("label", { htmlFor: inputId, className: labelClassNames, children: label })), jsxRuntime.jsx(FieldMessage, { helperId: helperId, errorId: errorId, error: error, errorMessage: errorMessage, helperText: helperText, errorLiveRegion: errorLiveRegion, helperClassName: styles$9['helper-text'], errorClassName: styles$9['error-message'] })] }));
});
TextField.displayName = 'TextField';

// useOutsideClick - dismiss on interaction outside a set of elements
//
// Consolidates the dismissal logic MenuBar and MenuDropdown each had their
// own copy of (issue #55).
//
// Listens on `pointerdown` in the capture phase but defers the callback to
// the subsequent `click`, so a control rendered in a portal still receives
// its own click before the menu closes (issue #36).
function useOutsideClick({ enabled = true, refs, onOutside }) {
    const onOutsideRef = React.useRef(onOutside);
    onOutsideRef.current = onOutside;
    const refsRef = React.useRef(refs);
    refsRef.current = refs;
    React.useEffect(() => {
        if (!enabled)
            return;
        const isInside = (target) => {
            if (!target)
                return false;
            return refsRef.current.some((ref) => ref.current?.contains(target));
        };
        // Tracks whether the gesture *started* outside. Dismissing on a click
        // whose pointerdown began inside would swallow drag-to-select gestures
        // that happen to end outside the menu.
        let startedOutside = false;
        const handlePointerDown = (event) => {
            startedOutside = !isInside(event.target);
        };
        const handleClick = (event) => {
            if (!startedOutside)
                return;
            startedOutside = false;
            if (isInside(event.target))
                return;
            onOutsideRef.current();
        };
        const handleEscape = (event) => {
            if (event.key === 'Escape')
                onOutsideRef.current();
        };
        document.addEventListener('pointerdown', handlePointerDown, true);
        document.addEventListener('click', handleClick, true);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown, true);
            document.removeEventListener('click', handleClick, true);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [enabled]);
}

// useMenuPosition - keep a dropdown inside the viewport
//
// Dropdowns were positioned purely in CSS, directly beneath their trigger, so
// near the bottom or right edge they overflowed the viewport and were clipped
// by any ancestor with `overflow: hidden` (issue #34).
//
// This measures the menu after it opens and flips or shifts it when it would
// overflow, re-measuring on scroll and resize. It is a deliberately small
// stand-in for a full positioning library: menus here are simple, always
// anchored to their trigger, and never need middleware beyond flip + shift.
function useMenuPosition({ open, anchorRef, menuRef, align = 'left', padding = 8, }) {
    const [position, setPosition] = React.useState({ style: {}, flipped: false });
    // Avoids an infinite measure→setState→measure loop: we only commit when
    // the computed values actually differ from what is already applied.
    const lastRef = React.useRef('');
    const update = React.useCallback(() => {
        const anchor = anchorRef.current;
        const menu = menuRef.current;
        if (!anchor || !menu)
            return;
        const anchorRect = anchor.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        // Flip above the trigger when there isn't room below but there is above.
        const spaceBelow = viewportHeight - anchorRect.bottom - padding;
        const spaceAbove = anchorRect.top - padding;
        const flipped = menuRect.height > spaceBelow && spaceAbove > spaceBelow;
        // Shift horizontally so the menu stays fully on screen, preferring the
        // requested alignment and only moving as far as needed.
        let left = align === 'right' ? anchorRect.right - menuRect.width : anchorRect.left;
        const maxLeft = viewportWidth - menuRect.width - padding;
        if (left > maxLeft)
            left = maxLeft;
        if (left < padding)
            left = padding;
        const top = flipped ? anchorRect.top - menuRect.height : anchorRect.bottom;
        // Clamp the height so a very long menu scrolls instead of overflowing.
        const maxHeight = flipped ? spaceAbove : spaceBelow;
        const style = {
            position: 'fixed',
            left: `${Math.round(left)}px`,
            top: `${Math.round(top)}px`,
            maxHeight: `${Math.max(0, Math.round(maxHeight))}px`,
            overflowY: 'auto',
        };
        const signature = `${style.left}|${style.top}|${style.maxHeight}|${flipped}`;
        if (signature === lastRef.current)
            return;
        lastRef.current = signature;
        setPosition({ style, flipped });
    }, [anchorRef, menuRef, align, padding]);
    // Measure before paint so the menu never renders in the wrong place first.
    React.useLayoutEffect(() => {
        if (!open) {
            lastRef.current = '';
            return;
        }
        update();
    }, [open, update]);
    React.useEffect(() => {
        if (!open)
            return;
        // `true` captures scrolls in any ancestor, not just the window.
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        // Catches the menu's own content changing size after it opened.
        const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
        if (observer && menuRef.current)
            observer.observe(menuRef.current);
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
            observer?.disconnect();
        };
    }, [open, update, menuRef]);
    return position;
}

var styles$8 = {"wrapper":"Select-module_wrapper","wrapper--full-width":"Select-module_wrapper--full-width","wrapper--disabled":"Select-module_wrapper--disabled","wrapper--label-top":"Select-module_wrapper--label-top","wrapper--label-left":"Select-module_wrapper--label-left","wrapper--label-right":"Select-module_wrapper--label-right","label":"Select-module_label","label--sm":"Select-module_label--sm","label--md":"Select-module_label--md","label--lg":"Select-module_label--lg","select":"Select-module_select","select--sm":"Select-module_select--sm","select--md":"Select-module_select--md","select--lg":"Select-module_select--lg","select--full-width":"Select-module_select--full-width","select--error":"Select-module_select--error","helper-text":"Select-module_helper-text","error-message":"Select-module_error-message","wrapper--sm":"Select-module_wrapper--sm","wrapper--md":"Select-module_wrapper--md","wrapper--lg":"Select-module_wrapper--lg","value":"Select-module_value","placeholder":"Select-module_placeholder","arrow":"Select-module_arrow","listbox":"Select-module_listbox","option":"Select-module_option","option--active":"Select-module_option--active","option--disabled":"Select-module_option--disabled","optionCheck":"Select-module_optionCheck","optionGroupLabel":"Select-module_optionGroupLabel"};

/** Index of the first option that isn't disabled, searching in `step` order. */
function findEnabled(options, from, step) {
    for (let i = from; i >= 0 && i < options.length; i += step) {
        if (!options[i]?.disabled)
            return i;
    }
    return -1;
}
function SelectInner({ label, labelPosition = 'top', size = 'md', fullWidth = false, error = false, errorMessage, helperText, options, value: controlledValue, defaultValue, onValueChange, placeholder = 'Select…', disabled = false, required = false, name, id, className = '', 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, }, ref) {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const listboxId = `${selectId}-listbox`;
    const helperId = `${selectId}-helper`;
    const errorId = `${selectId}-error`;
    const labelId = `${selectId}-label`;
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef(null);
    const triggerRef = React.useRef(null);
    const listboxRef = React.useRef(null);
    const selectedIndex = React.useMemo(() => options.findIndex((option) => option.value === value), [options, value]);
    // Which option the keyboard cursor sits on while the list is open. It
    // tracks the selection when opening, so typing continues from there.
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const setTriggerRef = React.useCallback((node) => {
        triggerRef.current = node;
        if (typeof ref === 'function')
            ref(node);
        else if (ref)
            ref.current = node;
    }, [ref]);
    useOutsideClick({
        enabled: isOpen,
        refs: [containerRef, listboxRef],
        onOutside: () => setIsOpen(false),
    });
    // Keeps the popup on screen near a viewport edge, same as the menus.
    const { style: popupStyle } = useMenuPosition({
        open: isOpen,
        anchorRef: triggerRef,
        menuRef: listboxRef,
    });
    const commit = React.useCallback((next) => {
        if (!isControlled)
            setUncontrolledValue(next);
        onValueChange?.(next);
    }, [isControlled, onValueChange]);
    const open = React.useCallback(() => {
        if (disabled)
            return;
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : findEnabled(options, 0, 1));
        setIsOpen(true);
    }, [disabled, options, selectedIndex]);
    const close = React.useCallback((returnFocus = true) => {
        setIsOpen(false);
        if (returnFocus)
            triggerRef.current?.focus();
    }, []);
    const selectAt = React.useCallback((index) => {
        const option = options[index];
        if (!option || option.disabled)
            return;
        commit(option.value);
        close();
    }, [options, commit, close]);
    // Scroll the active option into view as the cursor moves, so keyboard
    // navigation through a long list stays visible.
    React.useEffect(() => {
        if (!isOpen || activeIndex < 0)
            return;
        const node = listboxRef.current?.querySelector(`[data-option-index="${activeIndex}"]`);
        // Optional-called: scrollIntoView is absent in non-browser DOM
        // implementations, and losing the scroll nicety must not throw.
        node?.scrollIntoView?.({ block: 'nearest' });
    }, [isOpen, activeIndex]);
    // Type-ahead buffer: typing "ba" jumps to the first option starting "ba".
    const typeaheadRef = React.useRef({
        query: '',
        timer: null,
    });
    const runTypeahead = React.useCallback((char) => {
        const state = typeaheadRef.current;
        if (state.timer !== null)
            window.clearTimeout(state.timer);
        state.query += char.toLowerCase();
        state.timer = window.setTimeout(() => {
            state.query = '';
            state.timer = null;
        }, 500);
        const match = options.findIndex((option) => !option.disabled && option.label.toLowerCase().startsWith(state.query));
        if (match === -1)
            return;
        if (isOpen) {
            setActiveIndex(match);
            return;
        }
        const matched = options[match];
        if (matched)
            commit(matched.value);
    }, [options, isOpen, commit]);
    const handleKeyDown = React.useCallback((event) => {
        if (disabled)
            return;
        // A single printable character feeds type-ahead rather than any
        // navigation behaviour.
        if (event.key.length === 1 && event.key !== ' ' && !event.metaKey && !event.ctrlKey) {
            event.preventDefault();
            runTypeahead(event.key);
            return;
        }
        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp': {
                event.preventDefault();
                const step = event.key === 'ArrowDown' ? 1 : -1;
                if (!isOpen) {
                    open();
                    return;
                }
                const from = activeIndex < 0 ? (step > 0 ? 0 : options.length - 1) : activeIndex + step;
                const next = findEnabled(options, from, step);
                if (next !== -1)
                    setActiveIndex(next);
                break;
            }
            case 'Home': {
                if (!isOpen)
                    return;
                event.preventDefault();
                setActiveIndex(findEnabled(options, 0, 1));
                break;
            }
            case 'End': {
                if (!isOpen)
                    return;
                event.preventDefault();
                setActiveIndex(findEnabled(options, options.length - 1, -1));
                break;
            }
            case 'Enter':
            case ' ': {
                event.preventDefault();
                if (!isOpen)
                    open();
                else if (activeIndex >= 0)
                    selectAt(activeIndex);
                break;
            }
            case 'Escape': {
                if (!isOpen)
                    return;
                event.preventDefault();
                close();
                break;
            }
            case 'Tab': {
                // Tab commits nothing and simply dismisses, matching native
                // listbox behaviour; focus continues naturally.
                if (isOpen)
                    setIsOpen(false);
                break;
            }
        }
    }, [disabled, isOpen, activeIndex, options, open, close, selectAt, runTypeahead]);
    const describedByIds = [
        helperText && !error ? helperId : null,
        error && errorMessage ? errorId : null,
        ariaDescribedBy || null,
    ]
        .filter(Boolean)
        .join(' ');
    const wrapperClassNames = [
        styles$8.wrapper,
        styles$8[`wrapper--label-${labelPosition}`],
        fullWidth && styles$8['wrapper--full-width'],
        disabled && styles$8['wrapper--disabled'],
        className,
    ]
        .filter(Boolean)
        .join(' ');
    const triggerClassNames = [
        styles$8.select,
        styles$8[`select--${size}`],
        fullWidth && styles$8['select--full-width'],
        error && styles$8['select--error'],
    ]
        .filter(Boolean)
        .join(' ');
    const labelClassNames = [styles$8.label, styles$8[`label--${size}`]].filter(Boolean).join(' ');
    const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;
    const labelElement = label ? (jsxRuntime.jsx("span", { id: labelId, className: labelClassNames, onClick: () => triggerRef.current?.focus(), role: "presentation", children: label })) : null;
    return (jsxRuntime.jsxs("div", { ref: containerRef, className: wrapperClassNames, children: [labelElement && (labelPosition === 'top' || labelPosition === 'left') && labelElement, name && jsxRuntime.jsx("input", { type: "hidden", name: name, value: value ?? '' }), jsxRuntime.jsxs("button", { ref: setTriggerRef, id: selectId, type: "button", className: triggerClassNames, disabled: disabled, onClick: () => (isOpen ? close(false) : open()), onKeyDown: handleKeyDown, role: "combobox", "aria-haspopup": "listbox", "aria-expanded": isOpen, "aria-controls": isOpen ? listboxId : undefined, "aria-activedescendant": isOpen && activeIndex >= 0 ? `${selectId}-option-${activeIndex}` : undefined, "aria-label": ariaLabel, "aria-labelledby": !ariaLabel && label ? labelId : undefined, "aria-invalid": error || undefined, "aria-required": required || undefined, "aria-describedby": describedByIds || undefined, children: [jsxRuntime.jsx("span", { className: selectedOption ? styles$8.value : styles$8.placeholder, children: selectedOption ? selectedOption.label : placeholder }), jsxRuntime.jsx("span", { className: styles$8.arrow, "aria-hidden": "true" })] }), isOpen && (jsxRuntime.jsx("div", { ref: listboxRef, id: listboxId, className: styles$8.listbox, style: popupStyle, role: "listbox", "aria-labelledby": label ? labelId : undefined, tabIndex: -1, children: options.map((option, index) => {
                    const isSelected = index === selectedIndex;
                    const isActive = index === activeIndex;
                    // A heading is drawn whenever the group changes, so
                    // consecutive options collapse under one label.
                    const previousGroup = index > 0 ? options[index - 1]?.group : undefined;
                    const startsGroup = option.group && option.group !== previousGroup;
                    return (jsxRuntime.jsxs(React.Fragment, { children: [startsGroup && (jsxRuntime.jsx("div", { className: styles$8.optionGroupLabel, role: "presentation", children: option.group })), jsxRuntime.jsxs("div", { id: `${selectId}-option-${index}`, "data-option-index": index, className: [
                                    styles$8.option,
                                    isSelected && styles$8['option--selected'],
                                    isActive && styles$8['option--active'],
                                    option.disabled && styles$8['option--disabled'],
                                ]
                                    .filter(Boolean)
                                    .join(' '), role: "option", "aria-selected": isSelected, "aria-disabled": option.disabled || undefined, 
                                // The list keeps DOM focus on the trigger and
                                // tracks the cursor with aria-activedescendant,
                                // so pointer hover only moves the cursor.
                                onMouseEnter: () => !option.disabled && setActiveIndex(index), onClick: () => selectAt(index), children: [jsxRuntime.jsx("span", { className: styles$8.optionCheck, "aria-hidden": "true", children: isSelected ? '✓' : '' }), option.label] })] }, String(option.value)));
                }) })), labelElement && labelPosition === 'right' && labelElement, helperText && !error && (jsxRuntime.jsx("p", { id: helperId, className: styles$8['helper-text'], children: helperText })), error && errorMessage && (jsxRuntime.jsx("p", { id: errorId, className: styles$8['error-message'], role: "alert", children: errorMessage }))] }));
}
const SelectWithRef = React.forwardRef(SelectInner);
SelectWithRef.displayName = 'Select';
/**
 * Mac OS 9 style Select.
 *
 * A custom listbox, so the opened option list is drawn by the library rather
 * than the operating system and keeps the Mac OS 9 look. Supports arrow-key
 * navigation, Home/End, type-ahead, Escape, and `aria-activedescendant`.
 *
 * @example
 * ```tsx
 * <Select<'red' | 'blue'>
 *   label="Colour"
 *   options={[
 *     { value: 'red', label: 'Red' },
 *     { value: 'blue', label: 'Blue' },
 *   ]}
 *   value={colour}
 *   onValueChange={setColour}  // receives 'red' | 'blue'
 * />
 * ```
 */
const Select = SelectWithRef;

var styles$7 = {"pixelated-corner-sm":"Tabs-module_pixelated-corner-sm","pixelated-corner-md":"Tabs-module_pixelated-corner-md","pixelated-corner-pseudo":"Tabs-module_pixelated-corner-pseudo","mac-corner":"Tabs-module_mac-corner","chamfered-sm":"Tabs-module_chamfered-sm","chamfered-md":"Tabs-module_chamfered-md","tab-corner":"Tabs-module_tab-corner","button-corner":"Tabs-module_button-corner","window-corner":"Tabs-module_window-corner","container":"Tabs-module_container","tabList":"Tabs-module_tabList","tabList--full-width":"Tabs-module_tabList--full-width","tab":"Tabs-module_tab","tab--active":"Tabs-module_tab--active","tab--disabled":"Tabs-module_tab--disabled","tab--sm":"Tabs-module_tab--sm","tab--md":"Tabs-module_tab--md","tab--lg":"Tabs-module_tab--lg","tab--full-width":"Tabs-module_tab--full-width","tabIcon":"Tabs-module_tabIcon","panelContainer":"Tabs-module_panelContainer","panelContainer--sm":"Tabs-module_panelContainer--sm","panelContainer--md":"Tabs-module_panelContainer--md","panelContainer--lg":"Tabs-module_panelContainer--lg"};

/**
 * TabPanel component - Individual tab content
 * Must be used as a child of Tabs component
 */
function TabPanel({ children, }) {
    return jsxRuntime.jsx(jsxRuntime.Fragment, { children: children });
}
TabPanel.displayName = 'TabPanel';
/**
 * Mac OS 9 style Tabs component
 *
 * Classic tabbed navigation with raised tab appearance and inset panel.
 *
 * Features:
 * - Classic Mac OS 9 tab styling
 * - Controlled and uncontrolled modes
 * - Keyboard navigation (Arrow keys, Home, End)
 * - Full accessibility with ARIA
 * - Optional icons in tabs
 * - Disabled tab states
 *
 * @example
 * ```tsx
 * // Uncontrolled
 * <Tabs>
 *   <TabPanel label="General">
 *     <p>General settings content</p>
 *   </TabPanel>
 *   <TabPanel label="Advanced">
 *     <p>Advanced settings content</p>
 *   </TabPanel>
 * </Tabs>
 *
 * // Controlled
 * <Tabs activeTab={activeIndex} onValueChange={(value, index) => setActiveIndex(index)}>
 *   <TabPanel label="Tab 1">Content 1</TabPanel>
 *   <TabPanel label="Tab 2">Content 2</TabPanel>
 * </Tabs>
 * ```
 */
function TabsInner({ children, defaultActiveTab = 0, activeTab: controlledActiveTab, onChange, onValueChange, size = 'md', fullWidth = false, className = '', tabListClassName = '', panelClassName = '', ariaLabel, ariaLabelledBy, 'aria-label': ariaLabelAttr, 'aria-labelledby': ariaLabelledByAttr, }, ref) {
    // Controlled vs uncontrolled state
    const [uncontrolledActiveTab, setUncontrolledActiveTab] = React.useState(defaultActiveTab);
    const isControlled = controlledActiveTab !== undefined;
    const activeTabIndex = isControlled ? controlledActiveTab : uncontrolledActiveTab;
    // Standard attributes win; the camelCase aliases warn once in development.
    const resolvedAriaLabel = resolveAria('Tabs', 'aria-label', 'ariaLabel', ariaLabelAttr, ariaLabel) ?? 'Tabs';
    const resolvedAriaLabelledBy = resolveAria('Tabs', 'aria-labelledby', 'ariaLabelledBy', ariaLabelledByAttr, ariaLabelledBy);
    // `onValueChange` is the supported name; `onChange` still works and warns
    // once in development.
    if (process.env.NODE_ENV !== 'production' && onChange && !onValueChange) {
        warnDeprecatedProp('Tabs', 'onChange', 'onValueChange');
    }
    // Unique per Tabs instance. The ids used to be `tab-0` / `panel-0`, which
    // collided the moment a page rendered two Tabs — duplicate DOM ids, and
    // aria-controls on the second set pointing at the first set's panels.
    const baseId = React.useId();
    // Extract tab information from children.
    //
    // Memoised on `children`: this array was rebuilt on every render and fed
    // into the dependency list of handleTabChange and handleKeyDown, so both
    // callbacks were recreated every render and every tab button's props
    // churned along with them.
    const tabs = React.useMemo(() => React.Children.toArray(children).filter((child) => React.isValidElement(child)), [children]);
    // Handle tab change
    const handleTabChange = React.useCallback((index) => {
        const tab = tabs[index];
        if (!tab || tab.props.disabled)
            return;
        if (!isControlled) {
            setUncontrolledActiveTab(index);
        }
        if (onValueChange) {
            onValueChange(tab.props.value, index);
        }
        else if (onChange) {
            onChange(index, tab.props.value);
        }
    }, [tabs, isControlled, onValueChange, onChange]);
    // Keyboard navigation
    const handleKeyDown = React.useCallback((event, currentIndex) => {
        let newIndex;
        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                newIndex = currentIndex - 1;
                if (newIndex < 0)
                    newIndex = tabs.length - 1;
                // Skip disabled tabs
                while (tabs[newIndex]?.props.disabled && newIndex !== currentIndex) {
                    newIndex--;
                    if (newIndex < 0)
                        newIndex = tabs.length - 1;
                }
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault();
                newIndex = currentIndex + 1;
                if (newIndex >= tabs.length)
                    newIndex = 0;
                // Skip disabled tabs
                while (tabs[newIndex]?.props.disabled && newIndex !== currentIndex) {
                    newIndex++;
                    if (newIndex >= tabs.length)
                        newIndex = 0;
                }
                break;
            case 'Home':
                event.preventDefault();
                newIndex = 0;
                // Skip disabled tabs
                while (tabs[newIndex]?.props.disabled && newIndex < tabs.length - 1) {
                    newIndex++;
                }
                break;
            case 'End':
                event.preventDefault();
                newIndex = tabs.length - 1;
                // Skip disabled tabs
                while (tabs[newIndex]?.props.disabled && newIndex > 0) {
                    newIndex--;
                }
                break;
            default:
                return;
        }
        handleTabChange(newIndex);
    }, [tabs, handleTabChange]);
    // Class names
    const containerClassNames = mergeClasses(styles$7.container, className);
    const tabListClassNames = mergeClasses(styles$7.tabList, styles$7[`tabList--${size}`], fullWidth && styles$7['tabList--full-width'], tabListClassName);
    const panelContainerClassNames = mergeClasses(styles$7.panelContainer, styles$7[`panelContainer--${size}`], panelClassName);
    return (jsxRuntime.jsxs("div", { ref: ref, className: containerClassNames, children: [jsxRuntime.jsx("div", { role: "tablist", "aria-label": resolvedAriaLabelledBy ? undefined : resolvedAriaLabel, "aria-labelledby": resolvedAriaLabelledBy, className: tabListClassNames, children: tabs.map((tab, index) => {
                    const isActive = index === activeTabIndex;
                    const isDisabled = tab.props.disabled;
                    const tabClassNames = mergeClasses(styles$7.tab, styles$7[`tab--${size}`], isActive && styles$7['tab--active'], isDisabled && styles$7['tab--disabled'], fullWidth && styles$7['tab--full-width']);
                    return (jsxRuntime.jsxs("button", { role: "tab", type: "button", "aria-selected": isActive, "aria-controls": `${baseId}-panel-${index}`, id: `${baseId}-tab-${index}`, tabIndex: isActive ? 0 : -1, disabled: isDisabled, className: tabClassNames, onClick: () => handleTabChange(index), onKeyDown: (e) => handleKeyDown(e, index), children: [tab.props.icon && jsxRuntime.jsx("span", { className: styles$7.tabIcon, children: tab.props.icon }), tab.props.label] }, index));
                }) }), tabs.map((tab, index) => {
                const isActive = index === activeTabIndex;
                return (jsxRuntime.jsx("div", { role: "tabpanel", id: `${baseId}-panel-${index}`, "aria-labelledby": `${baseId}-tab-${index}`, hidden: !isActive, 
                    // A tab panel must be reachable from the tab list. When the
                    // panel holds nothing focusable — static text, an image —
                    // Tab from the selected tab skipped straight past the
                    // content, so the panel was unreachable by keyboard and
                    // unreadable in a screen reader's focus mode.
                    tabIndex: isActive ? 0 : undefined, className: panelContainerClassNames, children: isActive && tab.props.children }, index));
            })] }));
}
/**
 * `forwardRef` erases generics, so the forwarded component is re-cast to a
 * signature that keeps `TValue` — matching how ListView and Select are
 * exported. This is what makes a literal union survive into `onChange`:
 *
 * ```tsx
 * <Tabs<'general' | 'advanced'> onValueChange={(value, index) => …}>
 *   <TabPanel label="General" value="general">…</TabPanel>
 *   <TabPanel label="Advanced" value="advanced">…</TabPanel>
 * </Tabs>
 * ```
 */
const TabsWithRef = React.forwardRef(TabsInner);
const Tabs = TabsWithRef;
Tabs.displayName = 'Tabs';

const WindowManagerContext = React.createContext(null);
/**
 * Read the surrounding WindowManager, or `null` when there isn't one.
 * Window uses the null case to fall back to its own props.
 */
function useWindowManager() {
    return React.useContext(WindowManagerContext);
}
/**
 * Provides z-order coordination to every Window rendered beneath it.
 *
 * @example
 * ```tsx
 * <WindowManagerProvider>
 *   <Window title="Finder" draggable>…</Window>
 *   <Window title="Notes" draggable>…</Window>
 * </WindowManagerProvider>
 * ```
 */
function WindowManagerProvider({ children, baseZIndex = 100, }) {
    // Stack order, bottom-most first. The last entry is the active window.
    const [stack, setStack] = React.useState([]);
    // Mirrors `stack` for synchronous reads inside callbacks, so a raise()
    // during an event handler doesn't act on a stale render's array.
    const stackRef = React.useRef([]);
    stackRef.current = stack;
    const register = React.useCallback((id) => {
        setStack((current) => (current.includes(id) ? current : [...current, id]));
    }, []);
    const unregister = React.useCallback((id) => {
        setStack((current) => current.filter((entry) => entry !== id));
    }, []);
    const raise = React.useCallback((id) => {
        setStack((current) => {
            // Already on top — skip the state update entirely so a click on the
            // focused window doesn't re-render the whole stack.
            if (current[current.length - 1] === id)
                return current;
            const without = current.filter((entry) => entry !== id);
            return [...without, id];
        });
    }, []);
    const getZIndex = React.useCallback((id) => {
        const index = stackRef.current.indexOf(id);
        return index === -1 ? baseZIndex : baseZIndex + index;
    }, [baseZIndex]);
    const value = React.useMemo(() => ({
        register,
        unregister,
        raise,
        getZIndex,
        activeId: stack[stack.length - 1] ?? null,
    }), [register, unregister, raise, getZIndex, stack]);
    return jsxRuntime.jsx(WindowManagerContext.Provider, { value: value, children: children });
}

// usePointerGesture - shared pointer-drag lifecycle primitive
//
// Every drag-like interaction in the library follows the same shape:
// pointerdown captures some start state, pointermove updates from it, and
// pointerup/pointercancel tears down. Before this hook, Window, Scrollbar,
// MenuBar and MenuDropdown each re-implemented that lifecycle with their own
// document-level listeners (issue #55).
//
// Two behaviours are baked in so every consumer gets them for free:
//  - Moves are coalesced into a single requestAnimationFrame callback, so a
//    240Hz pointer can't drive more than one state update per frame (#21).
//  - Listeners attach once per gesture and read callbacks through a ref, so a
//    parent re-render mid-drag can't detach them and drop move events.
function usePointerGesture(handlers) {
    const [isActive, setIsActive] = React.useState(false);
    // Latest-callback ref: lets the effect below depend only on `isActive`,
    // so listeners survive parent re-renders mid-gesture.
    const handlersRef = React.useRef(handlers);
    handlersRef.current = handlers;
    const startStateRef = React.useRef(null);
    const start = React.useCallback((event) => {
        // Primary button / primary contact only. Filters right-click and the
        // secondary touches browsers report alongside the primary one.
        if (event.button !== 0 || !event.isPrimary)
            return;
        const startState = handlersRef.current.onStart(event);
        if (startState === null)
            return;
        startStateRef.current = startState;
        setIsActive(true);
    }, []);
    React.useEffect(() => {
        if (!isActive)
            return;
        // rAF coalescing: pointermove can fire well above display refresh
        // rate. We keep only the newest event and flush it once per frame.
        let frame = null;
        let pendingEvent = null;
        const flush = () => {
            frame = null;
            const event = pendingEvent;
            pendingEvent = null;
            const startState = startStateRef.current;
            if (!event || startState === null)
                return;
            handlersRef.current.onMove(event, startState);
        };
        const handlePointerMove = (event) => {
            if (!event.isPrimary)
                return;
            event.preventDefault();
            pendingEvent = event;
            if (frame === null)
                frame = requestAnimationFrame(flush);
        };
        const handlePointerEnd = () => {
            // Flush any move still queued so the gesture ends on the exact
            // final pointer position rather than the last painted frame.
            if (frame !== null) {
                cancelAnimationFrame(frame);
                flush();
            }
            const startState = startStateRef.current;
            startStateRef.current = null;
            setIsActive(false);
            if (startState !== null)
                handlersRef.current.onEnd?.(startState);
        };
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerEnd);
        document.addEventListener('pointercancel', handlePointerEnd);
        return () => {
            if (frame !== null)
                cancelAnimationFrame(frame);
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerEnd);
            document.removeEventListener('pointercancel', handlePointerEnd);
        };
    }, [isActive]);
    return { isActive, start };
}

// Geometry helpers shared by the drag and resize hooks.
//
// The original drag maths read `offsetParent` and called
// `getBoundingClientRect()` on it during every pointermove. That forced a
// synchronous layout each frame (issue #23) and produced wrong coordinates
// whenever an ancestor used `transform`, `filter`, `perspective`,
// `will-change` or `contain: paint` — all of which establish the containing
// block for `position: absolute` but are skipped by `offsetParent`, which
// also returns `null` inside a `position: fixed` chain (issue #22).
//
// Both problems go away by measuring once at gesture start and then working
// in pure pointer deltas: a delta in client coordinates is the same delta in
// any untransformed coordinate system, so the containing block never has to
// be identified again mid-gesture.
/**
 * Measure the containing block of `element` once, at gesture start.
 *
 * Falls back to the viewport when there is no positioned ancestor, which is
 * what a `position: fixed` element is actually laid out against.
 */
function measureContainingBlock(element) {
    const offsetParent = element.offsetParent;
    // A scaling ancestor makes the rendered size differ from the layout size.
    // The ratio recovers the scale without having to parse transform matrices.
    const rect = element.getBoundingClientRect();
    const scale = element.offsetWidth > 0 ? rect.width / element.offsetWidth : 1;
    if (offsetParent) {
        return {
            width: offsetParent.clientWidth,
            height: offsetParent.clientHeight,
            // Guard against a degenerate 0 scale (element hidden mid-measure).
            scale: scale > 0 ? scale : 1,
        };
    }
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : Number.MAX_SAFE_INTEGER;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : Number.MAX_SAFE_INTEGER;
    return {
        width: viewportWidth,
        height: viewportHeight,
        scale: scale > 0 ? scale : 1,
    };
}
/**
 * The element's current offset within its containing block, in local pixels.
 *
 * Uses `offsetLeft`/`offsetTop`, which are already expressed in the
 * containing block's coordinate system, so this needs no rect arithmetic and
 * stays correct under transforms.
 */
function measureOffset(element) {
    return { x: element.offsetLeft, y: element.offsetTop };
}
/** Clamp `value` into `[min, max]`, tolerating an inverted range. */
function clamp(value, min, max) {
    if (max < min)
        return min;
    return Math.min(max, Math.max(min, value));
}

// useDraggable - drag an absolutely-positioned element by a handle
//
// Extracted from Window (issue #55) so Dialog, FolderList and any future
// composite get identical drag behaviour instead of re-implementing the
// document-listener lifecycle.
function useDraggable(options) {
    const { enabled = true, resolveTarget, boundary = 'parent', boundaryBuffer = 24, onDrag, onDragStart, onDragEnd, } = options;
    // Read through a ref so the gesture never re-binds on a prop identity change.
    const optionsRef = React.useRef({ boundary, boundaryBuffer, onDrag, onDragStart, onDragEnd });
    optionsRef.current = { boundary, boundaryBuffer, onDrag, onDragStart, onDragEnd };
    const handleStart = React.useCallback((event) => {
        if (!enabled)
            return null;
        // Never start a drag from an interactive control inside the handle
        // — the window's own close/minimize buttons live there.
        if (event.target.closest('button, a[href], input, select, textarea')) {
            return null;
        }
        const element = resolveTarget ? resolveTarget(event) : event.currentTarget;
        if (!element)
            return null;
        event.preventDefault();
        const origin = measureOffset(element);
        const container = measureContainingBlock(element);
        optionsRef.current.onDragStart?.();
        return {
            pointerX: event.clientX,
            pointerY: event.clientY,
            originX: origin.x,
            originY: origin.y,
            width: element.offsetWidth,
            height: element.offsetHeight,
            container,
        };
    }, [enabled, resolveTarget]);
    const handleMove = React.useCallback((event, start) => {
        const { boundary: liveBoundary, boundaryBuffer: liveBuffer, onDrag: liveOnDrag, } = optionsRef.current;
        // Pure delta maths — no layout reads during the gesture.
        const scale = start.container.scale;
        let x = start.originX + (event.clientX - start.pointerX) / scale;
        let y = start.originY + (event.clientY - start.pointerY) / scale;
        if (liveBoundary === 'parent') {
            // Keep `liveBuffer` px of the element inside the container on every
            // edge. The top is clamped at 0 because a title bar dragged above
            // the container is unreachable rather than merely clipped.
            x = clamp(x, liveBuffer - start.width, start.container.width - liveBuffer);
            y = clamp(y, 0, start.container.height - liveBuffer);
        }
        liveOnDrag({ x, y });
    }, []);
    const handleEnd = React.useCallback(() => {
        optionsRef.current.onDragEnd?.();
    }, []);
    const gesture = usePointerGesture({
        onStart: handleStart,
        onMove: handleMove,
        onEnd: handleEnd,
    });
    return {
        isDragging: gesture.isActive,
        handleProps: {
            onPointerDown: gesture.start,
            // touch-action:none stops the browser claiming the gesture for
            // scrolling before our pointermove handler ever runs.
            style: enabled ? { touchAction: 'none' } : undefined,
        },
    };
}

// useResizable - resize an element by dragging a handle
//
// Supports all eight edge and corner handles (issue #27). Each direction
// contributes independently to width/height, and the two "inverse" edges
// (north, west) also report a position delta so the caller can keep the
// opposite edge visually anchored while the box grows toward the pointer.
function useResizable(options) {
    const { enabled = true, resolveTarget, minWidth = 200, minHeight = 100, maxWidth, maxHeight, onResize, onResizeStart, onResizeEnd, } = options;
    const optionsRef = React.useRef({
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
        onResize,
        onResizeStart,
        onResizeEnd,
    });
    optionsRef.current = {
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
        onResize,
        onResizeStart,
        onResizeEnd,
    };
    // Which handle is currently held; read inside onStart, which has no other
    // way to learn the direction from a generic pointer event.
    const directionRef = React.useRef('se');
    const clampedRef = React.useRef(false);
    const handleStart = React.useCallback((event) => {
        if (!enabled)
            return null;
        const element = resolveTarget ? resolveTarget(event) : event.currentTarget;
        if (!element)
            return null;
        event.preventDefault();
        event.stopPropagation();
        const rect = element.getBoundingClientRect();
        optionsRef.current.onResizeStart?.();
        return {
            direction: directionRef.current,
            pointerX: event.clientX,
            pointerY: event.clientY,
            width: rect.width,
            height: rect.height,
            container: measureContainingBlock(element),
        };
    }, [enabled, resolveTarget]);
    const handleMove = React.useCallback((event, start) => {
        const { minWidth: liveMinW, minHeight: liveMinH, maxWidth: liveMaxW, maxHeight: liveMaxH, onResize: liveOnResize, } = optionsRef.current;
        const scale = start.container.scale;
        const deltaX = (event.clientX - start.pointerX) / scale;
        const deltaY = (event.clientY - start.pointerY) / scale;
        const { direction } = start;
        const growsEast = direction.includes('e');
        const growsWest = direction.includes('w');
        const growsSouth = direction.includes('s');
        const growsNorth = direction.includes('n');
        let width = start.width;
        let height = start.height;
        if (growsEast)
            width = start.width + deltaX;
        if (growsWest)
            width = start.width - deltaX;
        if (growsSouth)
            height = start.height + deltaY;
        if (growsNorth)
            height = start.height - deltaY;
        const unclampedWidth = width;
        const unclampedHeight = height;
        width = Math.max(liveMinW, width);
        height = Math.max(liveMinH, height);
        if (liveMaxW !== undefined)
            width = Math.min(liveMaxW, width);
        if (liveMaxH !== undefined)
            height = Math.min(liveMaxH, height);
        clampedRef.current = width !== unclampedWidth || height !== unclampedHeight;
        // A north/west drag moves the anchored edge: the box grows toward the
        // pointer, so its origin shifts by however much the size actually
        // changed (which is not the raw delta once clamping kicks in).
        const dx = growsWest ? start.width - width : 0;
        const dy = growsNorth ? start.height - height : 0;
        liveOnResize({ width, height, dx, dy });
    }, []);
    const handleEnd = React.useCallback(() => {
        clampedRef.current = false;
        optionsRef.current.onResizeEnd?.();
    }, []);
    const gesture = usePointerGesture({
        onStart: handleStart,
        onMove: handleMove,
        onEnd: handleEnd,
    });
    const getHandleProps = React.useCallback((direction) => ({
        onPointerDown: (event) => {
            directionRef.current = direction;
            gesture.start(event);
        },
        style: { touchAction: 'none' },
        'data-direction': direction,
    }), [gesture]);
    return {
        isResizing: gesture.isActive,
        isClamped: clampedRef.current,
        getHandleProps,
    };
}

var styles$6 = {"window":"Window-module_window","window--active":"Window-module_window--active","window--inactive":"Window-module_window--inactive","window--draggable":"Window-module_window--draggable","titleBar":"Window-module_titleBar","titleCenter":"Window-module_titleCenter","titleBar--draggable":"Window-module_titleBar--draggable","titleBar--dragging":"Window-module_titleBar--dragging","controls":"Window-module_controls","controlButton":"Window-module_controlButton","closeBox":"Window-module_closeBox","minimizeBox":"Window-module_minimizeBox","maximizeBox":"Window-module_maximizeBox","titleText":"Window-module_titleText","content":"Window-module_content","resizeHandle":"Window-module_resizeHandle","resizeHandle--active":"Window-module_resizeHandle--active"};

/**
 * Minimum number of pixels of the title bar that must remain inside the
 * parent rect when `boundary="parent"` is active. Tuned to match a single
 * close-button hitbox so the user always has somewhere to grab.
 */
const DRAG_BOUNDARY_BUFFER = 24;
/** Multiplier applied to `keyboardStep` while Shift is held. */
const KEYBOARD_COARSE_MULTIPLIER = 10;
/**
 * Decorative pinstripe pattern that flanks the window title.
 *
 * Hoisted to module scope and wrapped in `React.memo` so the 16 `<rect>`
 * nodes are created once for the whole application instead of being
 * re-created on every drag frame.
 */
/**
 * Fills for the title bar pinstripe, driven by design tokens rather than
 * literal hexes so a consumer can retheme the title bar. Declared once at
 * module scope; SVG presentation attributes can't read var(), so these are
 * applied as inline styles.
 */
const PATTERN_FILL = { fill: 'var(--window-titlebar-pattern-fill)' };
const PATTERN_HIGHLIGHT = { fill: 'var(--window-titlebar-pattern-highlight)' };
const PATTERN_SHADE = { fill: 'var(--window-titlebar-pattern-shade)' };
const PATTERN_STRIPE = { fill: 'var(--window-titlebar-stripe)' };
const TitleBarPattern = React.memo(function TitleBarPattern() {
    return (jsxRuntime.jsxs("svg", { width: "132", height: "13", viewBox: "0 0 132 13", fill: "none", preserveAspectRatio: "none", "aria-hidden": "true", focusable: "false", xmlns: "http://www.w3.org/2000/svg", children: [jsxRuntime.jsx("rect", { width: "130.517", height: "13", style: PATTERN_FILL }), jsxRuntime.jsx("rect", { width: "1", height: "13", style: PATTERN_HIGHLIGHT }), jsxRuntime.jsx("rect", { x: "130", width: "1", height: "13", style: PATTERN_SHADE }), jsxRuntime.jsx("rect", { y: "1", width: "131.268", height: "1", style: PATTERN_STRIPE }), jsxRuntime.jsx("rect", { y: "5", width: "131.268", height: "1", style: PATTERN_STRIPE }), jsxRuntime.jsx("rect", { y: "9", width: "131.268", height: "1", style: PATTERN_STRIPE }), jsxRuntime.jsx("rect", { y: "3", width: "131.268", height: "1", style: PATTERN_STRIPE }), jsxRuntime.jsx("rect", { y: "7", width: "131.268", height: "1", style: PATTERN_STRIPE }), jsxRuntime.jsx("rect", { y: "11", width: "131.268", height: "1", style: PATTERN_STRIPE })] }));
});
/**
 * Mac OS 9 style Window component
 *
 * Classic window container with title bar and content area.
 *
 * Features:
 * - Classic Mac OS 9 window styling with beveled edges
 * - Optional title bar with window controls
 * - Active/inactive states
 * - Composable with a custom title bar via the `titleBar` prop
 * - Flexible sizing
 * - Draggable windows (optional) — by pointer or keyboard
 * - Resizable windows (optional) — by pointer or keyboard
 *
 * **Positioning caveat:** drag positions are expressed in the coordinate
 * space of the window's `offsetParent`. A CSS `transform`, `filter`, or
 * `perspective` on an ancestor creates a new containing block, which
 * changes what `offsetParent` resolves to. If you drag inside a transformed
 * subtree, make the direct parent `position: relative` so the coordinate
 * space is unambiguous.
 *
 * @example
 * ```tsx
 * // Simple window with title
 * <Window title="My Window">
 *   <p>Window content goes here</p>
 * </Window>
 *
 * // Window with a custom title bar. `titleBar` replaces the default one
 * // entirely, so it owns its own markup, styling, and drag affordance.
 * <Window titleBar={<MyToolbar onClose={close} />}>
 *   <p>Content</p>
 * </Window>
 *
 * // Draggable window (uncontrolled)
 * <Window title="Draggable" draggable>
 *   <p>Drag me by the title bar, or focus it and use the arrow keys.</p>
 * </Window>
 *
 * // Controlled draggable window
 * const [pos, setPos] = useState({ x: 0, y: 0 });
 * <Window title="Controlled" draggable position={pos} onPositionChange={setPos}>
 *   <p>Parent controls position</p>
 * </Window>
 * ```
 */
const Window = React.forwardRef(({ children, title, titleBar, active = true, width = 'auto', height = 'auto', className = '', contentClassName = '', classes, showControls = true, onClose, onMinimize, onMaximize, onMouseEnter, onActivate, zIndex, id, resizable = false, minWidth = 200, minHeight = 100, maxWidth, maxHeight, onResize, draggable = false, defaultPosition, position: controlledPosition, onPositionChange, boundary = 'parent', keyboardStep = 1, }, ref) => {
    // Optional z-order coordination. Outside a WindowManagerProvider this is
    // null and the component falls back to its own `active` / `zIndex`
    // props, so the manager is purely additive for existing consumers.
    const manager = useWindowManager();
    const generatedId = React.useId();
    const windowId = id ?? generatedId;
    React.useEffect(() => {
        if (!manager)
            return;
        manager.register(windowId);
        return () => manager.unregister(windowId);
        // `manager` identity changes whenever the stack does; depending on it
        // here would unregister and re-register on every raise.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowId]);
    // Root element, used by the keyboard handlers to measure the window
    // without a DOM query.
    const windowRef = React.useRef(null);
    // Drag and resize both run on the shared gesture hooks, which own the
    // pointer lifecycle: listeners attach once per gesture and read their
    // callbacks through a ref, moves are coalesced into one animation frame,
    // and the geometry is measured once at gesture start and then worked in
    // pure pointer deltas — which is what makes it correct under ancestor
    // transforms, where offsetParent lies about the containing block.
    // Drag state management
    const [internalPosition, setInternalPosition] = React.useState(defaultPosition || null);
    const [hasBeenDragged, setHasBeenDragged] = React.useState(!!defaultPosition);
    // Resize state. `hasBeenResized` flips on the first successful resize and
    // stays true, so the size persists after pointerup rather than snapping
    // back to the width/height props.
    const [internalSize, setInternalSize] = React.useState({ width, height });
    const [hasBeenResized, setHasBeenResized] = React.useState(false);
    // Latest-callback refs, so the commit helpers stay referentially stable.
    const latestRef = React.useRef({ controlledPosition, onPositionChange, onResize });
    React.useEffect(() => {
        latestRef.current = { controlledPosition, onPositionChange, onResize };
    });
    // Use controlled position if provided, otherwise use internal state
    const currentPosition = controlledPosition || internalPosition;
    // A window is absolutely positioned as soon as it has a position from any
    // source. Deriving this — rather than latching it at mount — means a
    // `position` prop supplied later still takes effect (issue #26).
    const isPositioned = draggable && (hasBeenDragged || currentPosition !== null);
    // Once resized, internalSize wins so the dimensions persist.
    const currentWidth = hasBeenResized ? internalSize.width : width;
    const currentHeight = hasBeenResized ? internalSize.height : height;
    /** Publishes a new position to whichever source of truth is in charge. */
    const commitPosition = React.useCallback((next) => {
        const { controlledPosition: liveControlled, onPositionChange: liveOnChange } = latestRef.current;
        if (liveControlled && liveOnChange) {
            liveOnChange(next);
        }
        else {
            setInternalPosition(next);
            liveOnChange?.(next);
        }
        setHasBeenDragged(true);
    }, []);
    /** Publishes a new size. Clamping is handled by useResizable. */
    const commitSize = React.useCallback((next) => {
        setInternalSize(next);
        setHasBeenResized(true);
        latestRef.current.onResize?.(next);
    }, []);
    // The title bar is the handle, but the whole window is what moves.
    const resolveWindow = React.useCallback((event) => event.currentTarget.closest(`.${styles$6.window}`), []);
    const { isDragging, handleProps: dragHandleProps } = useDraggable({
        enabled: draggable,
        resolveTarget: resolveWindow,
        boundary,
        boundaryBuffer: DRAG_BOUNDARY_BUFFER,
        onDrag: commitPosition,
    });
    const { isResizing, getHandleProps: getResizeHandleProps } = useResizable({
        enabled: resizable,
        resolveTarget: resolveWindow,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
        onResize: (rect) => commitSize({ width: rect.width, height: rect.height }),
    });
    // --- Keyboard equivalents (WCAG 2.1.1, issue #25) ---------------------
    /** Maps an arrow key to a unit delta, or null for any other key. */
    const arrowDelta = (key) => {
        switch (key) {
            case 'ArrowLeft':
                return { dx: -1, dy: 0 };
            case 'ArrowRight':
                return { dx: 1, dy: 0 };
            case 'ArrowUp':
                return { dx: 0, dy: -1 };
            case 'ArrowDown':
                return { dx: 0, dy: 1 };
            default:
                return null;
        }
    };
    const handleTitleBarKeyDown = React.useCallback((event) => {
        if (!draggable)
            return;
        const delta = arrowDelta(event.key);
        if (!delta)
            return;
        const windowElement = windowRef.current;
        if (!windowElement)
            return;
        event.preventDefault();
        const step = keyboardStep * (event.shiftKey ? KEYBOARD_COARSE_MULTIPLIER : 1);
        const container = measureContainingBlock(windowElement);
        // Before the first move the window is still in normal flow, so
        // derive its origin from its offset within the containing block.
        const origin = currentPosition ?? measureOffset(windowElement);
        let x = origin.x + delta.dx * step;
        let y = origin.y + delta.dy * step;
        // The pointer path clamps inside useDraggable; the keyboard path
        // applies the same rule here.
        if (boundary === 'parent') {
            x = clamp(x, DRAG_BOUNDARY_BUFFER - windowElement.offsetWidth, container.width - DRAG_BOUNDARY_BUFFER);
            y = clamp(y, 0, container.height - DRAG_BOUNDARY_BUFFER);
        }
        commitPosition({ x, y });
    }, [draggable, keyboardStep, currentPosition, commitPosition, boundary]);
    const handleResizeKeyDown = React.useCallback((event) => {
        if (!resizable)
            return;
        const delta = arrowDelta(event.key);
        if (!delta)
            return;
        const windowElement = windowRef.current;
        if (!windowElement)
            return;
        event.preventDefault();
        const step = keyboardStep * (event.shiftKey ? KEYBOARD_COARSE_MULTIPLIER : 1);
        const rect = windowElement.getBoundingClientRect();
        commitSize({
            width: clamp(rect.width + delta.dx * step, minWidth, maxWidth ?? Number.MAX_SAFE_INTEGER),
            height: clamp(rect.height + delta.dy * step, minHeight, maxHeight ?? Number.MAX_SAFE_INTEGER),
        });
    }, [resizable, keyboardStep, commitSize, minWidth, minHeight, maxWidth, maxHeight]);
    // --- Rendering --------------------------------------------------------
    // Inside a manager, "active" means "topmost in the stack"; outside one,
    // the caller's prop stands.
    const resolvedActive = manager ? manager.activeId === windowId : active;
    const resolvedZIndex = manager ? manager.getZIndex(windowId) : zIndex;
    const windowClassNames = mergeClasses(styles$6.window, resolvedActive ? styles$6['window--active'] : styles$6['window--inactive'], isPositioned && styles$6['window--draggable'], className, classes?.root);
    const contentClassNames = mergeClasses(styles$6.content, contentClassName, classes?.content);
    const titleBarClassNames = mergeClasses(styles$6.titleBar, draggable && styles$6['titleBar--draggable'], isDragging && styles$6['titleBar--dragging'], classes?.titleBar);
    const windowStyle = {};
    if (currentWidth !== 'auto') {
        windowStyle.width = typeof currentWidth === 'number' ? `${currentWidth}px` : currentWidth;
    }
    if (currentHeight !== 'auto') {
        windowStyle.height = typeof currentHeight === 'number' ? `${currentHeight}px` : currentHeight;
    }
    if (isPositioned && currentPosition) {
        windowStyle.position = 'absolute';
        windowStyle.left = `${currentPosition.x}px`;
        windowStyle.top = `${currentPosition.y}px`;
    }
    if (resolvedZIndex !== undefined) {
        windowStyle.zIndex = resolvedZIndex;
    }
    // Merge the forwarded ref with our internal one so keyboard handlers
    // can measure the window without a DOM query.
    const handleActivate = React.useCallback(() => {
        manager?.raise(windowId);
        onActivate?.();
    }, [manager, windowId, onActivate]);
    const setRootRef = React.useCallback((node) => {
        windowRef.current = node;
        if (typeof ref === 'function') {
            ref(node);
        }
        else if (ref) {
            ref.current = node;
        }
    }, [ref]);
    const renderTitleBar = () => {
        if (titleBar) {
            return titleBar;
        }
        if (title) {
            return (jsxRuntime.jsxs("div", { className: titleBarClassNames, "data-num-controls": [onClose, onMinimize, onMaximize].filter(Boolean).length, ...dragHandleProps, onKeyDown: draggable ? handleTitleBarKeyDown : undefined, tabIndex: draggable ? 0 : undefined, "aria-label": draggable ? `Move ${title} window` : undefined, "aria-keyshortcuts": draggable ? 'ArrowUp ArrowDown ArrowLeft ArrowRight' : undefined, children: [showControls && (jsxRuntime.jsxs("div", { className: mergeClasses(styles$6.controls, classes?.controls), children: [onClose && (jsxRuntime.jsx("button", { type: "button", className: mergeClasses(styles$6.controlButton, classes?.controlButton), onClick: onClose, "aria-label": "Close", title: "Close", children: jsxRuntime.jsx("div", { className: styles$6.closeBox }) })), onMinimize && (jsxRuntime.jsx("button", { type: "button", className: mergeClasses(styles$6.controlButton, classes?.controlButton), onClick: onMinimize, "aria-label": "Minimize", title: "Minimize", children: jsxRuntime.jsx("div", { className: styles$6.minimizeBox }) })), onMaximize && (jsxRuntime.jsx("button", { type: "button", className: mergeClasses(styles$6.controlButton, classes?.controlButton), onClick: onMaximize, "aria-label": "Maximize", title: "Maximize", children: jsxRuntime.jsx("div", { className: styles$6.maximizeBox }) }))] })), jsxRuntime.jsxs("div", { className: styles$6.titleCenter, children: [jsxRuntime.jsx(TitleBarPattern, {}), jsxRuntime.jsx("div", { className: mergeClasses(styles$6.titleText, classes?.titleText, 'bold'), children: title }), jsxRuntime.jsx(TitleBarPattern, {})] })] }));
        }
        return null;
    };
    return (jsxRuntime.jsxs("div", { ref: setRootRef, className: windowClassNames, style: windowStyle, onMouseEnter: onMouseEnter, onPointerDown: handleActivate, onFocusCapture: handleActivate, children: [renderTitleBar(), jsxRuntime.jsx("div", { className: contentClassNames, children: children }), resizable && (jsxRuntime.jsx("button", { type: "button", className: mergeClasses(styles$6.resizeHandle, isResizing && styles$6['resizeHandle--active'], classes?.resizeHandle), ...getResizeHandleProps('se'), onKeyDown: handleResizeKeyDown, "aria-label": "Resize window", "aria-keyshortcuts": "ArrowUp ArrowDown ArrowLeft ArrowRight", title: "Resize window" }))] }));
});
Window.displayName = 'Window';

var styles$5 = {"backdrop":"Dialog-module_backdrop","dialogContainer":"Dialog-module_dialogContainer"};

// --- Module-level dialog coordination -------------------------------------
// Stack of currently-open dialog containers. Only the last entry is treated
// as the "topmost" — it owns Escape and the Tab focus trap. This is the
// canonical web-platform approach for stacked modals and matches what
// browsers do internally for the dialog element.
const dialogStack = [];
// Reference-counted body scroll lock so two stacked dialogs don't fight
// over `document.body.style.overflow`. The first lock captures whatever
// value the host app had set, and the last release restores it.
let scrollLockCount = 0;
let savedBodyOverflow = null;
let savedBodyPaddingRight = null;
function lockBodyScroll() {
    if (typeof document === 'undefined')
        return;
    scrollLockCount += 1;
    if (scrollLockCount !== 1)
        return;
    const body = document.body;
    savedBodyOverflow = body.style.overflow;
    savedBodyPaddingRight = body.style.paddingRight;
    // Hiding overflow removes the scrollbar, and on platforms where the
    // scrollbar takes up layout space the page underneath jumps sideways by
    // its width the instant a dialog opens. Replacing that width with padding
    // keeps the layout still.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
        const currentPadding = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
        body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }
    body.style.overflow = 'hidden';
}
function unlockBodyScroll() {
    if (typeof document === 'undefined')
        return;
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount !== 0)
        return;
    document.body.style.overflow = savedBodyOverflow ?? '';
    document.body.style.paddingRight = savedBodyPaddingRight ?? '';
    savedBodyOverflow = null;
    savedBodyPaddingRight = null;
}
function isTopmost(el) {
    return el !== null && dialogStack[dialogStack.length - 1] === el;
}
// Comprehensive focusable-element selector. Covers everything the Tab key
// can naturally reach plus author-provided overrides via [tabindex]. The
// runtime filter excludes disabled, hidden, aria-hidden, and zero-size
// elements that should not be tab targets.
const FOCUSABLE_SELECTOR = [
    'a[href]',
    'area[href]',
    'button',
    'input',
    'select',
    'textarea',
    'iframe',
    'audio[controls]',
    'video[controls]',
    '[contenteditable="true"]',
    '[contenteditable=""]',
    'details > summary:first-of-type',
    '[tabindex]',
].join(',');
function isElementFocusable(el) {
    // Native disabled, programmatic disabled via aria-disabled,
    // explicit removal from tab order, and visibility checks.
    if (el.disabled)
        return false;
    if (el.getAttribute('tabindex') === '-1')
        return false;
    if (el.hidden)
        return false;
    if (el.closest('[aria-hidden="true"]'))
        return false;
    if (el.getClientRects().length === 0)
        return false;
    return true;
}
function getFocusables(root) {
    return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isElementFocusable);
}
/**
 * Mac OS 9 style Dialog component
 *
 * Modal dialog with backdrop, focus trapping, and keyboard handling.
 * Built on top of the Window component.
 *
 * Features:
 * - Classic Mac OS 9 dialog styling
 * - Modal backdrop with optional click-to-close
 * - Escape key to close (topmost dialog only when stacked)
 * - Focus trap that survives stacked dialogs
 * - Centered on screen
 * - Reference-counted body scroll lock
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <Dialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Confirm"
 *   width={350}
 *   role="alertdialog"
 * >
 *   <p id="confirm-msg">Are you sure?</p>
 *   <Button onClick={() => setOpen(false)}>Cancel</Button>
 *   <Button variant="primary">OK</Button>
 * </Dialog>
 * ```
 */
const Dialog = React.forwardRef(({ open = false, onClose, closeOnBackdropClick = true, closeOnEscape = true, backdropClassName = '', trapFocus = true, initialFocus, role = 'dialog', ariaLabel, ariaLabelledBy, ariaDescribedBy, 'aria-label': ariaLabelAttr, 'aria-labelledby': ariaLabelledByAttr, 'aria-describedby': ariaDescribedByAttr, container, children, ...windowProps }, ref) => {
    const dialogRef = React.useRef(null);
    const previousActiveElement = React.useRef(null);
    // Resolved after mount: `document` does not exist during a server
    // render, and touching it in the render body would break SSR.
    const [portalTarget, setPortalTarget] = React.useState(null);
    React.useEffect(() => {
        if (container === null)
            return;
        setPortalTarget(container ?? document.body);
    }, [container]);
    // Standard attributes win; the camelCase aliases warn once in development.
    const label = resolveAria('Dialog', 'aria-label', 'ariaLabel', ariaLabelAttr, ariaLabel);
    const labelledBy = resolveAria('Dialog', 'aria-labelledby', 'ariaLabelledBy', ariaLabelledByAttr, ariaLabelledBy);
    const describedBy = resolveAria('Dialog', 'aria-describedby', 'ariaDescribedBy', ariaDescribedByAttr, ariaDescribedBy);
    // Derive an accessible name. Prefer an explicit labelledby → label
    // → the Window title if it happens to be a plain string.
    const titleProp = windowProps.title;
    const resolvedAriaLabel = label ?? (typeof titleProp === 'string' ? titleProp : undefined);
    // Push/pop the dialog onto the stack and lock body scroll while open.
    // Combining these into one effect ensures they unwind in the right
    // order on close and avoids races with the other effects below.
    React.useEffect(() => {
        if (!open)
            return;
        const node = dialogRef.current;
        if (!node)
            return;
        previousActiveElement.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
        dialogStack.push(node);
        lockBodyScroll();
        return () => {
            const idx = dialogStack.indexOf(node);
            if (idx !== -1)
                dialogStack.splice(idx, 1);
            unlockBodyScroll();
            // Defer focus restoration so React can finish any unmount work
            // before we hand focus back; checking isConnected prevents a
            // silent jump-to-body if the trigger is gone.
            const prev = previousActiveElement.current;
            if (prev && prev.isConnected) {
                queueMicrotask(() => {
                    if (prev.isConnected)
                        prev.focus();
                });
            }
        };
        // portalTarget is a dependency because the dialog element does not
        // exist until the portal has a mount point — on the first render
        // after `open` flips, dialogRef.current is still null.
    }, [open, portalTarget]);
    // Initial focus. Runs before paint via useLayoutEffect so the user
    // never sees a flash of focus outside the dialog.
    React.useLayoutEffect(() => {
        if (!open || !dialogRef.current)
            return;
        const root = dialogRef.current;
        let target = null;
        if (typeof initialFocus === 'string') {
            try {
                target = root.querySelector(initialFocus);
            }
            catch {
                // Malformed selector — ignore and fall through to default.
                target = null;
            }
        }
        else if (initialFocus && 'current' in initialFocus) {
            target = initialFocus.current;
        }
        if (!target) {
            const focusables = getFocusables(root);
            const firstFocusable = focusables[0];
            if (firstFocusable) {
                target = firstFocusable;
            }
            else {
                // No focusable children — focus the container itself so the
                // trap still has somewhere to land. Make it programmatically
                // focusable in that case.
                if (!root.hasAttribute('tabindex'))
                    root.setAttribute('tabindex', '-1');
                target = root;
            }
        }
        target?.focus();
    }, [open, initialFocus, portalTarget]);
    // Escape: only the topmost dialog reacts so stacked dialogs close
    // one at a time. The bubble phase + stopPropagation also prevents
    // the host app's own Escape handlers from firing under the modal.
    React.useEffect(() => {
        if (!open || !closeOnEscape)
            return;
        const handler = (event) => {
            if (event.key !== 'Escape')
                return;
            if (!isTopmost(dialogRef.current))
                return;
            event.preventDefault();
            event.stopPropagation();
            onClose?.();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, closeOnEscape, onClose]);
    // Focus trap: same topmost-only rule.
    React.useEffect(() => {
        if (!open || !trapFocus)
            return;
        const handler = (event) => {
            if (event.key !== 'Tab' || !dialogRef.current)
                return;
            if (!isTopmost(dialogRef.current))
                return;
            const focusables = getFocusables(dialogRef.current);
            if (focusables.length === 0) {
                event.preventDefault();
                return;
            }
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            // getFocusables returned a non-empty array above, so both ends
            // exist; this narrows them for the compiler.
            if (!first || !last)
                return;
            const active = document.activeElement;
            // If focus has escaped the dialog (e.g., user clicked outside
            // and Tabbed), pull it back in.
            if (!active || !dialogRef.current.contains(active)) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus();
                return;
            }
            if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, trapFocus]);
    // Backdrop click closes only when the click originated on the
    // backdrop itself, not on a child element that bubbled up.
    const handleBackdropClick = React.useCallback((event) => {
        if (closeOnBackdropClick && event.target === event.currentTarget) {
            onClose?.();
        }
    }, [closeOnBackdropClick, onClose]);
    if (!open)
        return null;
    const backdropClassNames = mergeClasses(styles$5.backdrop, backdropClassName);
    const dialogTree = (jsxRuntime.jsx("div", { className: backdropClassNames, onClick: handleBackdropClick, children: jsxRuntime.jsx("div", { className: styles$5.dialogContainer, ref: dialogRef, role: role, "aria-modal": "true", "aria-label": labelledBy ? undefined : resolvedAriaLabel, "aria-labelledby": labelledBy, "aria-describedby": describedBy, children: jsxRuntime.jsx(Window, { ...windowProps, ref: ref, active: true, onClose: onClose, children: children }) }) }));
    // `container === null` opts out of portalling entirely.
    if (container === null)
        return dialogTree;
    // Before the mount effect resolves a target there is nothing to portal
    // into; rendering null for that first pass keeps SSR output empty and
    // matches what the client produces on hydration.
    return portalTarget ? reactDom.createPortal(dialogTree, portalTarget) : null;
});
Dialog.displayName = 'Dialog';

var styles$4 = {"menuItem":"MenuItem-module_menuItem","menuItem--disabled":"MenuItem-module_menuItem--disabled","menuItem--selected":"MenuItem-module_menuItem--selected","menuItem--separator":"MenuItem-module_menuItem--separator","checkmark":"MenuItem-module_checkmark","icon":"MenuItem-module_icon","label":"MenuItem-module_label","shortcut":"MenuItem-module_shortcut","submenuArrow":"MenuItem-module_submenuArrow","submenu":"MenuItem-module_submenu","separatorLine":"MenuItem-module_separatorLine"};

/**
 * Modifier glyphs and words, mapped to the modifier names that
 * `aria-keyshortcuts` accepts.
 */
const SHORTCUT_MODIFIERS = [
    [/⌘|cmd|command/gi, 'Meta'],
    [/⌥|opt|option/gi, 'Alt'],
    [/⇧|shift/gi, 'Shift'],
    [/⌃|ctrl|control/gi, 'Control'],
];
/**
 * Converts a displayed shortcut into an `aria-keyshortcuts` value.
 *
 * A menu item that shows "⌘S" communicates nothing to a screen reader: the
 * glyph is not announced as a key combination and there is no attribute
 * carrying the binding. This produces "Meta+S" for that attribute while the
 * visible text stays as designed.
 */
function toAriaKeyShortcuts(shortcut) {
    if (!shortcut)
        return undefined;
    let result = shortcut.trim();
    for (const [pattern, name] of SHORTCUT_MODIFIERS) {
        result = result.replace(pattern, `${name}+`);
    }
    // Collapse the separators that the source notation may or may not have
    // used, then drop any trailing one.
    result = result
        .replace(/\s*\+\s*/g, '+')
        .replace(/\++/g, '+')
        .replace(/\+$/, '');
    return result.length > 0 ? result : undefined;
}
/**
 * Mac OS 9 style MenuItem component
 *
 * Individual menu item for use within MenuBar or dropdown menus.
 *
 * Features:
 * - Classic Mac OS 9 menu item styling
 * - Disabled state support
 * - Keyboard shortcut display
 * - Checkmark support for toggle items
 * - Separator support
 * - Selected/active state
 * - Icon support
 * - Submenu indicator
 * - Full keyboard and mouse support
 *
 * @example
 * ```tsx
 * // Basic menu item
 * <MenuItem label="Open..." onClick={() => console.log('Open')} />
 *
 * // With keyboard shortcut
 * <MenuItem label="Save" shortcut="⌘S" onClick={() => console.log('Save')} />
 *
 * // Disabled item
 * <MenuItem label="Undo" disabled />
 *
 * // Checked item (toggle)
 * <MenuItem label="Show Grid" checked onClick={() => console.log('Toggle')} />
 *
 * // With separator
 * <MenuItem label="Preferences..." separator onClick={() => console.log('Prefs')} />
 *
 * // With submenu indicator
 * <MenuItem label="Recent Files" hasSubmenu />
 * ```
 */
const MenuItem = React.forwardRef(({ label, shortcut, keyShortcut, disabled = false, selected = false, separator = false, checked = false, icon, onClick, onFocus, onBlur, className = '', hasSubmenu = false, items, }, ref) => {
    const [isSubmenuOpen, setIsSubmenuOpen] = React.useState(false);
    const effectiveHasSubmenu = hasSubmenu || !!items;
    // Internal refs to the trigger button and submenu container, used by the
    // keyboard handler to move focus into / out of the submenu. The trigger
    // ref is fanned out so the consumer's forwardRef still receives the node.
    const buttonRef = React.useRef(null);
    const submenuRef = React.useRef(null);
    const setButtonRef = React.useCallback((node) => {
        buttonRef.current = node;
        if (typeof ref === 'function')
            ref(node);
        else if (ref)
            ref.current = node;
    }, [ref]);
    // Class names
    const menuItemClassNames = mergeClasses(styles$4.menuItem, selected ? styles$4['menuItem--selected'] : '', disabled ? styles$4['menuItem--disabled'] : '', separator ? styles$4['menuItem--separator'] : '', className);
    // Handle click
    const handleClick = (event) => {
        if (disabled) {
            event.preventDefault();
            return;
        }
        onClick?.(event);
    };
    // WAI-ARIA menu pattern: ArrowRight opens the submenu and moves focus
    // to its first item; ArrowLeft closes the submenu and returns focus
    // to the parent. Hover behavior (mouse enter/leave) is unchanged.
    const handleKeyDown = (event) => {
        if (!effectiveHasSubmenu || disabled)
            return;
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            setIsSubmenuOpen(true);
            // Defer focus until after the submenu renders.
            queueMicrotask(() => {
                const firstItem = submenuRef.current?.querySelector('[role="menuitem"]');
                firstItem?.focus();
            });
        }
        else if (event.key === 'ArrowLeft' && isSubmenuOpen) {
            event.preventDefault();
            setIsSubmenuOpen(false);
            buttonRef.current?.focus();
        }
    };
    return (jsxRuntime.jsxs("div", { className: styles$4.menuItemContainer, onMouseEnter: () => setIsSubmenuOpen(true), onMouseLeave: () => setIsSubmenuOpen(false), style: { position: 'relative', width: '100%' }, children: [jsxRuntime.jsxs("button", { ref: setButtonRef, type: "button", className: menuItemClassNames, onClick: handleClick, onKeyDown: handleKeyDown, onFocus: onFocus, onBlur: onBlur, disabled: disabled, 
                // aria-checked is only valid on menuitemcheckbox /
                // menuitemradio, never on a plain menuitem, so the role
                // follows the presence of a checked state.
                role: checked ? 'menuitemcheckbox' : 'menuitem', "aria-disabled": disabled, "aria-checked": checked ? 'true' : undefined, "aria-keyshortcuts": keyShortcut ?? toAriaKeyShortcuts(shortcut), "aria-haspopup": effectiveHasSubmenu ? 'menu' : undefined, "aria-expanded": effectiveHasSubmenu ? isSubmenuOpen : undefined, children: [jsxRuntime.jsx("span", { className: styles$4.checkmark, children: checked && '✓' }), icon && jsxRuntime.jsx("span", { className: styles$4.icon, children: icon }), jsxRuntime.jsx("span", { className: styles$4.label, children: label }), shortcut && (jsxRuntime.jsx("span", { className: styles$4.shortcut, "aria-hidden": "true", children: shortcut })), effectiveHasSubmenu && (jsxRuntime.jsx("span", { className: styles$4.submenuArrow, "aria-hidden": "true", children: "\u25B6" }))] }), items && isSubmenuOpen && (jsxRuntime.jsx("div", { ref: submenuRef, className: styles$4.submenu, role: "menu", children: items })), separator && jsxRuntime.jsx("div", { className: styles$4.separatorLine, role: "separator" })] }));
});
MenuItem.displayName = 'MenuItem';

var styles$3 = {"menuBar":"MenuBar-module_menuBar","leftContent":"MenuBar-module_leftContent","menusContainer":"MenuBar-module_menusContainer","menuContainer":"MenuBar-module_menuContainer","rightContent":"MenuBar-module_rightContent","menuButton":"MenuBar-module_menuButton","menuLabel":"MenuBar-module_menuLabel","menuButton--disabled":"MenuBar-module_menuButton--disabled","menuButton--open":"MenuBar-module_menuButton--open","dropdown":"MenuBar-module_dropdown","dropdown--right":"MenuBar-module_dropdown--right"};

/** Narrows `Menu.items` to the data form. */
function isMenuItemDataArray(items) {
    return Array.isArray(items) && (items.length === 0 || !React.isValidElement(items[0]));
}
/** Renders the data form of a menu into MenuItem elements. */
function renderMenuItemData(items) {
    return items.map((item, index) => (jsxRuntime.jsx(MenuItem, { label: item.label, shortcut: item.shortcut, disabled: item.disabled, checked: item.checked, separator: item.separator, icon: item.icon, onClick: item.onClick, items: item.submenu ? renderMenuItemData(item.submenu) : undefined }, `${item.label}-${index}`)));
}
/**
 * Mac OS 9 style MenuBar component
 *
 * Horizontal menu bar with dropdown menus, logo support, and status area.
 *
 * Features:
 * - Classic Mac OS 9 menu bar styling
 * - Horizontal menu layout
 * - Dropdown menus on click
 * - Link-type menu items for navigation
 * - Logo/icon support on the left
 * - Status area on the right (clock, system indicators, etc.)
 * - Full WAI-ARIA menubar semantics with a roving tabindex
 * - Keyboard navigation (Left/Right for menus, Down to open, Escape to close)
 * - Click outside to close
 * - Controlled or uncontrolled open state
 * - Disabled menu support
 *
 * @example
 * ```tsx
 * const [openMenu, setOpenMenu] = useState<number | undefined>();
 *
 * <MenuBar
 *   leftContent={<img src="/logo.png" alt="Logo" width={16} height={16} />}
 *   openMenuIndex={openMenu}
 *   onMenuOpen={setOpenMenu}
 *   onMenuClose={() => setOpenMenu(undefined)}
 *   menus={[
 *     {
 *       label: 'File',
 *       type: 'dropdown',
 *       // Data form — no JSX required
 *       items: [
 *         { label: 'Open…', shortcut: '⌘O', onClick: openFile },
 *         { label: 'Save', shortcut: '⌘S', onClick: saveFile, separator: true },
 *         { label: 'Quit', onClick: quit },
 *       ],
 *     },
 *     {
 *       label: 'Edit',
 *       type: 'dropdown',
 *       // JSX form — still supported
 *       items: <MenuItem label="Undo" shortcut="⌘Z" onClick={undo} />,
 *     },
 *     { label: 'Home', type: 'link', href: '/' },
 *   ]}
 *   rightContent={[<Clock key="clock" />]}
 * />
 * ```
 */
const MenuBar = React.forwardRef(({ menus, openMenuIndex, defaultOpenMenuIndex, onMenuOpen, onMenuClose, className = '', dropdownClassName = '', leftContent, rightContent, }, ref) => {
    const [menuBarElement, setMenuBarElement] = React.useState(null);
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    const [internalOpenIndex, setInternalOpenIndex] = React.useState(defaultOpenMenuIndex);
    // One id per MenuBar instance; each trigger derives a stable id from it
    // so its dropdown can point at it with aria-labelledby.
    const baseId = React.useId();
    const triggerId = (index) => `${baseId}-menu-${index}`;
    // Trigger elements, so keyboard navigation can move real DOM focus
    // rather than only tracking an index.
    const triggerRefs = React.useRef([]);
    const isControlled = openMenuIndex !== undefined;
    const activeOpenIndex = isControlled ? openMenuIndex : internalOpenIndex;
    const handleMenuOpenInternal = React.useCallback((index) => {
        if (!isControlled) {
            setInternalOpenIndex(index);
        }
        onMenuOpen?.(index);
    }, [isControlled, onMenuOpen]);
    const handleMenuCloseInternal = React.useCallback(() => {
        if (!isControlled) {
            setInternalOpenIndex(undefined);
        }
        onMenuClose?.();
    }, [isControlled, onMenuClose]);
    // Close when a click lands outside the menu bar.
    //
    // This listens for `click`, not `mousedown`. On mousedown the menu
    // closed before the pointer was released, so any dropdown content
    // rendered into a portal — a nested menu, a picker — unmounted before
    // its own click handler could run, and choosing such an item did
    // nothing at all. By `click` the item's handler has already fired.
    React.useEffect(() => {
        if (activeOpenIndex === undefined || !menuBarElement)
            return;
        const handleClickOutside = (event) => {
            if (!menuBarElement.contains(event.target)) {
                handleMenuCloseInternal();
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeOpenIndex, menuBarElement, handleMenuCloseInternal]);
    // Escape closes the open menu and returns focus to its trigger.
    React.useEffect(() => {
        if (activeOpenIndex === undefined)
            return;
        const handleEscape = (event) => {
            if (event.key !== 'Escape')
                return;
            event.preventDefault();
            const openIndex = activeOpenIndex;
            handleMenuCloseInternal();
            triggerRefs.current[openIndex]?.focus();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [activeOpenIndex, handleMenuCloseInternal]);
    /** Moves focus to a trigger, skipping disabled menus. */
    const focusTrigger = React.useCallback((startIndex, step) => {
        const count = menus.length;
        if (count === 0)
            return;
        for (let offset = 0; offset < count; offset += 1) {
            const index = (((startIndex + step * offset) % count) + count) % count;
            if (menus[index]?.disabled)
                continue;
            setFocusedIndex(index);
            triggerRefs.current[index]?.focus();
            // If a menu was already open, opening the newly focused one
            // matches how a menu bar behaves once it is "active".
            if (activeOpenIndex !== undefined && menus[index]?.type !== 'link') {
                handleMenuOpenInternal(index);
            }
            return;
        }
    }, [menus, activeOpenIndex, handleMenuOpenInternal]);
    // Keyboard navigation, per the WAI-ARIA menubar pattern.
    const handleKeyDown = React.useCallback((event) => {
        const current = focusedIndex >= 0 ? focusedIndex : (activeOpenIndex ?? 0);
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                focusTrigger(current - 1, -1);
                break;
            case 'ArrowRight':
                event.preventDefault();
                focusTrigger(current + 1, 1);
                break;
            case 'Home':
                event.preventDefault();
                focusTrigger(0, 1);
                break;
            case 'End':
                event.preventDefault();
                focusTrigger(menus.length - 1, -1);
                break;
            case 'ArrowDown': {
                event.preventDefault();
                const menu = menus[current];
                if (menu && !menu.disabled && menu.type !== 'link') {
                    handleMenuOpenInternal(current);
                }
                break;
            }
            case 'Enter':
            case ' ': {
                event.preventDefault();
                const menu = menus[current];
                if (!menu || menu.disabled)
                    break;
                if (menu.type === 'link') {
                    menu.onClick?.();
                }
                else if (activeOpenIndex === current) {
                    handleMenuCloseInternal();
                }
                else {
                    handleMenuOpenInternal(current);
                }
                break;
            }
        }
    }, [
        activeOpenIndex,
        focusedIndex,
        menus,
        focusTrigger,
        handleMenuOpenInternal,
        handleMenuCloseInternal,
    ]);
    // Handle menu button click
    const handleMenuClick = (index) => {
        const menu = menus[index];
        if (!menu || menu.disabled)
            return;
        if (menu.type === 'link') {
            // For link-type menus, trigger the onClick handler
            menu.onClick?.();
            return;
        }
        if (activeOpenIndex === index) {
            // Clicking the same menu closes it
            handleMenuCloseInternal();
        }
        else {
            // Open the clicked menu
            handleMenuOpenInternal(index);
        }
    };
    // Class names
    const menuBarClassNames = mergeClasses(styles$3.menuBar, className);
    const dropdownClassNames = mergeClasses(styles$3.dropdown, dropdownClassName);
    // Callback ref to handle both internal state and forwarded ref
    const handleRef = React.useCallback((node) => {
        setMenuBarElement(node);
        if (typeof ref === 'function') {
            ref(node);
        }
        else if (ref) {
            ref.current = node;
        }
    }, [ref]);
    // Roving tabindex: exactly one trigger is in the tab order at a time,
    // and the arrow keys move between them. Without this, every menu was a
    // separate tab stop, which is not how a menu bar is meant to behave.
    const rovingIndex = focusedIndex >= 0 ? focusedIndex : (activeOpenIndex ?? 0);
    return (jsxRuntime.jsxs("div", { ref: handleRef, className: menuBarClassNames, role: "menubar", onKeyDown: handleKeyDown, children: [leftContent && jsxRuntime.jsx("div", { className: styles$3.leftContent, children: leftContent }), jsxRuntime.jsx("div", { className: styles$3.menusContainer, children: menus.map((menu, index) => {
                    const isOpen = activeOpenIndex === index;
                    const isDropdown = menu.type !== 'link';
                    const id = triggerId(index);
                    const menuButtonClassNames = mergeClasses(styles$3.menuButton, isOpen ? styles$3['menuButton--open'] : '', menu.disabled ? styles$3['menuButton--disabled'] : '');
                    // The label used to be an <h3>, which put a heading into the
                    // document outline for every menu — so a page with a menu bar
                    // announced "File, heading level 3" and polluted screen-reader
                    // heading navigation. It is a span now, styled to match.
                    const label = jsxRuntime.jsx("span", { className: styles$3.menuLabel, children: menu.label });
                    // For link-type menus, render as anchor if href is provided.
                    // sanitizeUrl strips javascript:/data:/vbscript: schemes before the
                    // href reaches the DOM, preventing stored-XSS when consumers wire
                    // menus from CMS or user-supplied data.
                    if (menu.type === 'link' && menu.href) {
                        const safeHref = sanitizeUrl(menu.href);
                        return (jsxRuntime.jsx("div", { className: styles$3.menuContainer, children: jsxRuntime.jsx("a", { id: id, ref: (node) => {
                                    triggerRefs.current[index] = node;
                                }, href: safeHref, className: menuButtonClassNames, role: "menuitem", tabIndex: index === rovingIndex ? 0 : -1, onClick: (e) => {
                                    if (menu.onClick) {
                                        e.preventDefault();
                                        menu.onClick();
                                    }
                                }, onFocus: () => setFocusedIndex(index), "aria-disabled": menu.disabled, children: label }) }, index));
                    }
                    // Standard dropdown menu or link without href
                    return (jsxRuntime.jsxs("div", { className: styles$3.menuContainer, children: [jsxRuntime.jsx("button", { id: id, ref: (node) => {
                                    triggerRefs.current[index] = node;
                                }, type: "button", className: menuButtonClassNames, role: "menuitem", tabIndex: index === rovingIndex ? 0 : -1, onClick: () => handleMenuClick(index), onFocus: () => setFocusedIndex(index), disabled: menu.disabled, "aria-haspopup": isDropdown ? 'menu' : undefined, "aria-expanded": isDropdown ? isOpen : undefined, "aria-disabled": menu.disabled, children: label }), isOpen && isDropdown && menu.items && (
                            // aria-labelledby ties the dropdown back to the trigger
                            // that opened it, so assistive tech announces "File menu"
                            // rather than an anonymous menu.
                            jsxRuntime.jsx("div", { className: dropdownClassNames, role: "menu", "aria-labelledby": id, children: isMenuItemDataArray(menu.items)
                                    ? renderMenuItemData(menu.items)
                                    : menu.items }))] }, index));
                }) }), rightContent && (jsxRuntime.jsx("div", { className: styles$3.rightContent, children: Array.isArray(rightContent)
                    ? rightContent.map((item, index) => (jsxRuntime.jsx(React.Fragment, { children: item }, index)))
                    : rightContent }))] }));
});
MenuBar.displayName = 'MenuBar';

/** Gap left between the dropdown and the viewport edge when repositioning. */
const VIEWPORT_MARGIN = 4;
/**
 * Mac OS 9 style MenuDropdown component
 *
 * A standalone dropdown menu that shares the styling of the MenuBar.
 * Useful for placing menus in the status area (rightContent) or other parts
 * of the app.
 *
 * @example
 * ```tsx
 * <MenuDropdown
 *   label="Options"
 *   align="right"
 *   items={
 *     <>
 *       <MenuItem label="Preferences…" onClick={openPrefs} />
 *       <MenuItem label="Sign out" onClick={signOut} />
 *     </>
 *   }
 * />
 * ```
 */
const MenuDropdown = React.forwardRef(({ label, items, disabled = false, className = '', dropdownClassName = '', align = 'left', avoidCollisions = true, }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [collisionOffset, setCollisionOffset] = React.useState(null);
    const containerRef = React.useRef(null);
    const dropdownRef = React.useRef(null);
    const triggerId = React.useId();
    // Fan the internal ref out to the forwarded one so the consumer still
    // gets the node while collision detection keeps its own handle.
    const setContainerRef = React.useCallback((node) => {
        containerRef.current = node;
        if (typeof ref === 'function') {
            ref(node);
        }
        else if (ref) {
            ref.current = node;
        }
    }, [ref]);
    // Close when a click lands outside.
    //
    // Listens for `click` rather than `mousedown` so that dropdown content
    // rendered into a portal still receives its own click before the menu
    // unmounts. See the matching note in MenuBar.
    React.useEffect(() => {
        if (!isOpen)
            return;
        const handleClickOutside = (event) => {
            const container = containerRef.current;
            const dropdown = dropdownRef.current;
            const target = event.target;
            if (container?.contains(target) || dropdown?.contains(target))
                return;
            setIsOpen(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);
    // Handle Escape key to close menu
    React.useEffect(() => {
        if (!isOpen)
            return;
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setIsOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);
    // Keep the dropdown inside the viewport.
    //
    // Without this, a menu near the right edge of the window — which is
    // exactly where a status-area menu lives — rendered partly or entirely
    // off-screen with no way to reach its items. Measured before paint so
    // the corrected position is the first one the user sees.
    React.useLayoutEffect(() => {
        if (!isOpen || !avoidCollisions) {
            setCollisionOffset(null);
            return;
        }
        const dropdown = dropdownRef.current;
        if (!dropdown)
            return;
        // Measure in the un-nudged position.
        const rect = dropdown.getBoundingClientRect();
        let x = 0;
        let y = 0;
        const overflowRight = rect.right - (window.innerWidth - VIEWPORT_MARGIN);
        if (overflowRight > 0)
            x -= overflowRight;
        const overflowLeft = VIEWPORT_MARGIN - (rect.left + x);
        if (overflowLeft > 0)
            x += overflowLeft;
        // No room below: flip above the trigger.
        const overflowBottom = rect.bottom - (window.innerHeight - VIEWPORT_MARGIN);
        if (overflowBottom > 0) {
            const trigger = containerRef.current?.getBoundingClientRect();
            const spaceAbove = trigger ? trigger.top : 0;
            y =
                rect.height + (trigger?.height ?? 0) <= spaceAbove
                    ? -(rect.height + (trigger?.height ?? 0))
                    : -overflowBottom;
        }
        setCollisionOffset(x === 0 && y === 0 ? null : { x, y });
    }, [isOpen, avoidCollisions, items]);
    const handleToggle = () => {
        if (!disabled) {
            setIsOpen((open) => !open);
        }
    };
    const menuContainerClassNames = mergeClasses(styles$3.menuContainer, className);
    const menuButtonClassNames = mergeClasses(styles$3.menuButton, isOpen ? styles$3['menuButton--open'] : '', disabled ? styles$3['menuButton--disabled'] : '');
    const dropdownClassNames = mergeClasses(styles$3.dropdown, align === 'right' ? styles$3['dropdown--right'] : '', dropdownClassName);
    return (jsxRuntime.jsxs("div", { ref: setContainerRef, className: menuContainerClassNames, children: [jsxRuntime.jsx("button", { id: triggerId, type: "button", className: menuButtonClassNames, onClick: handleToggle, disabled: disabled, "aria-haspopup": "menu", "aria-expanded": isOpen, "aria-disabled": disabled, children: typeof label === 'string' ? jsxRuntime.jsx("span", { className: styles$3.menuLabel, children: label }) : label }), isOpen && (jsxRuntime.jsx("div", { ref: dropdownRef, className: dropdownClassNames, role: "menu", "aria-labelledby": triggerId, style: collisionOffset
                    ? { transform: `translate(${collisionOffset.x}px, ${collisionOffset.y}px)` }
                    : undefined, onClick: () => setIsOpen(false), children: items }))] }));
});
MenuDropdown.displayName = 'MenuDropdown';

var styles$2 = {"scrollbar":"Scrollbar-module_scrollbar","scrollbar--vertical":"Scrollbar-module_scrollbar--vertical","scrollbar--horizontal":"Scrollbar-module_scrollbar--horizontal","scrollbar--disabled":"Scrollbar-module_scrollbar--disabled","arrow":"Scrollbar-module_arrow","arrowIcon":"Scrollbar-module_arrowIcon","arrow--start":"Scrollbar-module_arrow--start","arrow--end":"Scrollbar-module_arrow--end","track":"Scrollbar-module_track","thumb":"Scrollbar-module_thumb","thumb--dragging":"Scrollbar-module_thumb--dragging"};

/**
 * Mac OS 9 style Scrollbar component
 *
 * Classic scrollbar with arrow buttons and draggable thumb.
 * Can be used standalone or integrated with scrollable content.
 *
 * @example
 * ```tsx
 * <Scrollbar
 *   orientation="vertical"
 *   value={0.5}
 *   viewportRatio={0.3}
 *   onValueChange={(value) => console.log('Scroll position:', value)}
 * />
 * ```
 */
const Scrollbar = React.forwardRef(({ orientation = 'vertical', value = 0, viewportRatio, onChange, onValueChange, 'aria-label': ariaLabelAttr, className = '', disabled = false, ariaLabel, controls, step = 0.1, }, ref) => {
    const trackRef = React.useRef(null);
    const isVertical = orientation === 'vertical';
    // Helper used by both arrow buttons and keyboard handler to clamp
    // the next value into the valid 0-1 range before notifying.
    // `onValueChange` is the supported name; `onChange` still works and
    // warns once in development.
    if (process.env.NODE_ENV !== 'production' && onChange && !onValueChange) {
        warnDeprecatedProp('Scrollbar', 'onChange', 'onValueChange');
    }
    const emitValue = onValueChange ?? onChange;
    const commitValue = React.useCallback((next) => {
        if (disabled || !emitValue)
            return;
        const clamped = Math.max(0, Math.min(1, next));
        if (clamped !== value)
            emitValue(clamped);
    }, [disabled, emitValue, value]);
    // Calculate thumb size based on viewport ratio
    // Omitting viewportRatio is a wiring mistake, not a styling choice, so
    // say so in development and fall back to a full-length thumb — the
    // honest rendering of "we do not know how long the content is".
    if (process.env.NODE_ENV !== 'production' && viewportRatio === undefined) {
        console.warn('Scrollbar: `viewportRatio` is required to size the thumb and the page step. ' +
            'Pass clientHeight / scrollHeight (or the width equivalent) for the scrolled region.');
    }
    const effectiveViewportRatio = viewportRatio ?? 1;
    // Standard attribute wins; the camelCase alias warns once in development.
    const resolvedAriaLabel = resolveAria('Scrollbar', 'aria-label', 'ariaLabel', ariaLabelAttr, ariaLabel);
    const thumbSize = Math.max(effectiveViewportRatio * 100, 10); // Minimum 10% size
    // Calculate thumb position
    const maxThumbPos = 100 - thumbSize;
    const thumbPos = value * maxThumbPos;
    // Class names
    const classNames = mergeClasses(styles$2.scrollbar, styles$2[`scrollbar--${orientation}`], disabled && styles$2['scrollbar--disabled'], className);
    // Handle arrow clicks
    const handleDecrement = React.useCallback(() => commitValue(value - step), [commitValue, step, value]);
    const handleIncrement = React.useCallback(() => commitValue(value + step), [commitValue, step, value]);
    // WAI-ARIA scrollbar keyboard interaction.
    // Arrow keys step by `step`, PageUp/PageDown step by `viewportRatio`,
    // Home/End jump to the extremes. The handler is attached to the
    // focusable track so it only fires when the scrollbar itself has focus.
    const handleKeyDown = React.useCallback((event) => {
        if (disabled)
            return;
        const decKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
        const incKey = isVertical ? 'ArrowDown' : 'ArrowRight';
        switch (event.key) {
            case decKey:
                event.preventDefault();
                commitValue(value - step);
                break;
            case incKey:
                event.preventDefault();
                commitValue(value + step);
                break;
            case 'PageUp':
                event.preventDefault();
                commitValue(value - effectiveViewportRatio);
                break;
            case 'PageDown':
                event.preventDefault();
                commitValue(value + effectiveViewportRatio);
                break;
            case 'Home':
                event.preventDefault();
                commitValue(0);
                break;
            case 'End':
                event.preventDefault();
                commitValue(1);
                break;
        }
    }, [commitValue, disabled, isVertical, step, value, effectiveViewportRatio]);
    // Handle track clicks
    const handleTrackClick = React.useCallback((event) => {
        if (disabled || !emitValue || !trackRef.current)
            return;
        const rect = trackRef.current.getBoundingClientRect();
        const clickPos = isVertical ? event.clientY - rect.top : event.clientX - rect.left;
        const trackSize = isVertical ? rect.height : rect.width;
        // Convert click position to scroll value (0-1)
        const clickRatio = clickPos / trackSize;
        const newValue = Math.max(0, Math.min(1, clickRatio));
        emitValue(newValue);
    }, [disabled, emitValue, isVertical]);
    // Thumb dragging runs on the shared pointer gesture hook, which owns the
    // lifecycle: listeners attach once per gesture rather than re-binding
    // whenever a dependency changes mid-drag, and moves are coalesced into
    // one animation frame.
    //
    // The previous effect also guarded on `onChange` specifically, so a
    // consumer using only `onValueChange` could not drag the thumb at all.
    const { isActive: isDragging, start: startThumbDrag } = usePointerGesture({
        onStart: (event) => {
            if (disabled || !emitValue)
                return null;
            if (event.button !== 0 || !event.isPrimary)
                return null;
            const track = trackRef.current;
            if (!track)
                return null;
            event.preventDefault();
            event.stopPropagation();
            const rect = track.getBoundingClientRect();
            return {
                pointer: isVertical ? event.clientY : event.clientX,
                value,
                // Measured once: the track cannot resize mid-drag.
                trackSize: isVertical ? rect.height : rect.width,
            };
        },
        onMove: (event, dragStart) => {
            if (dragStart.trackSize <= 0)
                return;
            const current = isVertical ? event.clientY : event.clientX;
            const delta = (current - dragStart.pointer) / dragStart.trackSize;
            emitValue?.(Math.max(0, Math.min(1, dragStart.value + delta)));
        },
    });
    return (jsxRuntime.jsxs("div", { ref: ref, className: classNames, children: [jsxRuntime.jsx("button", { type: "button", className: `${styles$2.arrow} ${styles$2['arrow--start']}`, onClick: handleDecrement, disabled: disabled, "aria-label": isVertical ? 'Scroll up' : 'Scroll left', children: jsxRuntime.jsx("div", { className: styles$2.arrowIcon }) }), jsxRuntime.jsx("div", { ref: trackRef, className: styles$2.track, onClick: handleTrackClick, onKeyDown: handleKeyDown, role: "scrollbar", tabIndex: disabled ? -1 : 0, "aria-valuenow": Math.round(value * 100), "aria-valuemin": 0, "aria-valuemax": 100, "aria-orientation": orientation, "aria-label": resolvedAriaLabel, "aria-controls": controls, "aria-disabled": disabled || undefined, children: jsxRuntime.jsx("div", { className: mergeClasses(styles$2.thumb, isDragging && styles$2['thumb--dragging']), style: {
                        [isVertical ? 'height' : 'width']: `${thumbSize}%`,
                        [isVertical ? 'top' : 'left']: `${thumbPos}%`,
                        touchAction: 'none',
                    }, onPointerDown: startThumbDrag }) }), jsxRuntime.jsx("button", { type: "button", className: `${styles$2.arrow} ${styles$2['arrow--end']}`, onClick: handleIncrement, disabled: disabled, "aria-label": isVertical ? 'Scroll down' : 'Scroll right', children: jsxRuntime.jsx("div", { className: styles$2.arrowIcon }) })] }));
});
Scrollbar.displayName = 'Scrollbar';

var styles$1 = {"listView":"ListView-module_listView","header":"ListView-module_header","headerCell":"ListView-module_headerCell","sortable":"ListView-module_sortable","sortIndicator":"ListView-module_sortIndicator","body":"ListView-module_body","row":"ListView-module_row","selected":"ListView-module_selected","cell":"ListView-module_cell","icon":"ListView-module_icon","placeholder":"ListView-module_placeholder"};

/**
 * Coerces an arbitrary cell value into something React can render.
 *
 * Rows are typed with an `unknown` index signature, so a value read out of
 * one is not automatically a ReactNode.
 */
function renderValue(value) {
    if (value === null || value === undefined || typeof value === 'boolean')
        return null;
    if (typeof value === 'string' || typeof value === 'number')
        return value;
    if (React.isValidElement(value))
        return value;
    return String(value);
}
function ListViewRowInner({ item, columns, columnStyles, rowIndex, isSelected, isHovered, isFocusable, rowId, hoveredColumnKey, classes, onRowKeyDown, onRowClick, onRowDoubleClick, onRowEnter, onRowLeave, onCellEnter, onCellLeave, onCellClickInternal, renderRow, renderCell, }) {
    const rowDefaultProps = {
        key: item.id,
        id: rowId,
        className: mergeClasses(styles$1.row, isSelected && styles$1.selected, classes?.row),
        // Rows are listbox options: focusable one at a time via a roving
        // tabindex, so the list is a single tab stop that the arrow keys move
        // within. Before this they were plain divs with onClick, which made
        // selecting and opening an item impossible without a pointer.
        role: 'option',
        'aria-selected': isSelected,
        tabIndex: isFocusable ? 0 : -1,
        onKeyDown: (event) => onRowKeyDown(item, rowIndex, event),
        onClick: (event) => onRowClick(item, event),
        onDoubleClick: () => onRowDoubleClick(item),
        onMouseEnter: () => onRowEnter(item),
        onMouseLeave: () => onRowLeave(item),
        'data-selected': isSelected,
        'data-index': rowIndex,
        'data-item-id': item.id,
    };
    if (renderRow) {
        const rowState = { isSelected, isHovered, index: rowIndex };
        return jsxRuntime.jsx(jsxRuntime.Fragment, { children: renderRow(item, rowState, rowDefaultProps) });
    }
    // `key` is passed to the element explicitly rather than arriving through
    // the spread: React reads `key` off the JSX element, not off the props
    // object, so spreading it silently produced keyless children.
    const { key: _key, ...rowElementProps } = rowDefaultProps;
    return (jsxRuntime.jsx("div", { ...rowElementProps, children: columns.map((column, columnIndex) => {
            const value = item[column.key];
            const isCellHovered = isHovered && hoveredColumnKey === column.key;
            const cellState = {
                isHovered: isCellHovered,
                isRowSelected: isSelected,
                columnIndex,
                rowIndex,
            };
            return (jsxRuntime.jsx("div", { className: mergeClasses(styles$1.cell, classes?.cell), style: columnStyles[columnIndex], "data-column": column.key, "data-hovered": isCellHovered, onClick: (event) => onCellClickInternal(item, column, event), onMouseEnter: () => onCellEnter(item, column), onMouseLeave: () => onCellLeave(item, column), children: renderCell ? (renderCell(value, item, column, cellState)) : (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [columnIndex === 0 && item.icon ? (jsxRuntime.jsx("span", { className: styles$1.icon, children: item.icon })) : null, renderValue(value)] })) }, column.key));
        }) }));
}
const ListViewRow = React.memo(ListViewRowInner);
/**
 * Mac OS 9 style ListView component
 *
 * Multi-column list with sortable headers and row selection.
 * Similar to Finder list view.
 *
 * @example
 * ```tsx
 * <ListView
 *   columns={[
 *     { key: 'name', label: 'Name' },
 *     { key: 'modified', label: 'Date Modified' },
 *     { key: 'size', label: 'Size' }
 *   ]}
 *   items={[
 *     { id: '1', name: 'Document.txt', modified: 'Today', size: '2 KB' },
 *     { id: '2', name: 'Images', modified: 'Yesterday', size: '--' }
 *   ]}
 *   selectedIds={['1']}
 *   onSelectionChange={(ids) => console.log('Selected:', ids)}
 *   onItemMouseEnter={(item) => console.log('Hovering:', item.name)}
 * />
 *
 * // Typed rows
 * interface FileRow extends ListItem {
 *   name: string;
 *   size: number;
 * }
 * <ListView<FileRow> items={files} columns={columns} />
 * ```
 */
function ListViewInner({ columns, items, selectedIds = [], onSelectionChange, onItemOpen, onItemMouseEnter, onItemMouseLeave, onSort, className = '', height = 'auto', classes, ariaLabel, ariaLabelledBy, 'aria-label': ariaLabelAttr, 'aria-labelledby': ariaLabelledByAttr, emptyState = 'No items', loading = false, loadingState = 'Loading…', renderRow, renderCell, renderHeaderCell, onCellClick, onCellMouseEnter, onCellMouseLeave, }, ref) {
    const [sortColumn, setSortColumn] = React.useState(null);
    const [sortDirection, setSortDirection] = React.useState('asc');
    const [hoveredRow, setHoveredRow] = React.useState(null);
    const [hoveredColumnKey, setHoveredColumnKey] = React.useState(null);
    // Standard attributes win; the camelCase aliases warn once in development.
    const resolvedAriaLabel = resolveAria('ListView', 'aria-label', 'ariaLabel', ariaLabelAttr, ariaLabel) ?? 'List';
    const resolvedAriaLabelledBy = resolveAria('ListView', 'aria-labelledby', 'ariaLabelledBy', ariaLabelledByAttr, ariaLabelledBy);
    // Index of the row holding the list's single tab stop. Kept in state so the
    // roving tabindex follows the user's focus.
    const [focusedIndex, setFocusedIndex] = React.useState(0);
    // Ids are per-instance so two ListViews on a page can't collide.
    const baseId = React.useId();
    const bodyRef = React.useRef(null);
    // Membership tests run once per row per render. `selectedIds.includes()`
    // inside the row map made selection checking O(rows x selected), which on
    // a large list with a large selection is quadratic.
    const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
    // Anchor for Shift range selection, plus the selection as it stood before
    // the current Shift sequence began. Shift+click extends that base
    // selection with the anchor..target range instead of discarding
    // everything the user had already picked.
    const anchorIdRef = React.useRef(null);
    const baseSelectionRef = React.useRef([]);
    // Latest props, read from inside stable callbacks. Without this the row
    // handlers would change identity whenever the selection or item list
    // changed, defeating the row memoisation entirely.
    const latestRef = React.useRef({
        items,
        selectedIds,
        selectedSet,
        onSelectionChange,
        onItemOpen,
        onItemMouseEnter,
        onItemMouseLeave,
        onCellClick,
        onCellMouseEnter,
        onCellMouseLeave,
    });
    React.useEffect(() => {
        latestRef.current = {
            items,
            selectedIds,
            selectedSet,
            onSelectionChange,
            onItemOpen,
            onItemMouseEnter,
            onItemMouseLeave,
            onCellClick,
            onCellMouseEnter,
            onCellMouseLeave,
        };
    });
    // Class names
    const classNames = mergeClasses(styles$1.listView, className, classes?.root);
    // One style object per column, reused by every row. Previously each cell
    // allocated a fresh `{ width }` object on every render, which also meant
    // no row could ever be memoised on prop identity.
    const columnStyles = React.useMemo(() => columns.map((column) => ({
        width: typeof column.width === 'number' ? `${column.width}px` : column.width,
    })), [columns]);
    // Handle column header click
    const handleColumnClick = React.useCallback((columnKey, sortable = true) => {
        if (!sortable || !onSort)
            return;
        const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(columnKey);
        setSortDirection(newDirection);
        onSort(columnKey, newDirection);
    }, [sortColumn, sortDirection, onSort]);
    const handleRowClick = React.useCallback((item, event) => {
        const { items: liveItems, selectedIds: liveSelected, selectedSet: liveSelectedSet, onSelectionChange: liveOnChange, } = latestRef.current;
        if (!liveOnChange)
            return;
        const itemId = item.id;
        if (event.metaKey || event.ctrlKey) {
            // Toggle one item, and make it the anchor for a later Shift+click.
            anchorIdRef.current = itemId;
            baseSelectionRef.current = liveSelectedSet.has(itemId)
                ? liveSelected.filter((id) => id !== itemId)
                : [...liveSelected, itemId];
            liveOnChange([...baseSelectionRef.current]);
            return;
        }
        if (event.shiftKey && (anchorIdRef.current || liveSelected.length > 0)) {
            const anchorId = anchorIdRef.current ?? liveSelected[liveSelected.length - 1];
            const anchorIndex = liveItems.findIndex((candidate) => candidate.id === anchorId);
            const currentIndex = liveItems.findIndex((candidate) => candidate.id === itemId);
            if (anchorIndex === -1 || currentIndex === -1) {
                liveOnChange([itemId]);
                return;
            }
            const start = Math.min(anchorIndex, currentIndex);
            const end = Math.max(anchorIndex, currentIndex);
            const rangeIds = liveItems.slice(start, end + 1).map((candidate) => candidate.id);
            // Extend rather than replace: whatever was selected before this
            // Shift sequence stays selected.
            liveOnChange([...new Set([...baseSelectionRef.current, ...rangeIds])]);
            return;
        }
        // Single select — this click becomes the anchor and the new base.
        anchorIdRef.current = itemId;
        baseSelectionRef.current = [itemId];
        liveOnChange([itemId]);
    }, []);
    const handleRowDoubleClick = React.useCallback((item) => {
        latestRef.current.onItemOpen?.(item);
    }, []);
    const handleRowEnter = React.useCallback((item) => {
        setHoveredRow(item.id);
        latestRef.current.onItemMouseEnter?.(item);
    }, []);
    const handleRowLeave = React.useCallback((item) => {
        setHoveredRow(null);
        setHoveredColumnKey(null);
        latestRef.current.onItemMouseLeave?.(item);
    }, []);
    const handleCellEnter = React.useCallback((item, column) => {
        setHoveredColumnKey(column.key);
        latestRef.current.onCellMouseEnter?.(item, column);
    }, []);
    const handleCellLeave = React.useCallback((item, column) => {
        setHoveredColumnKey(null);
        latestRef.current.onCellMouseLeave?.(item, column);
    }, []);
    const handleCellClickInternal = React.useCallback((item, column, event) => {
        latestRef.current.onCellClick?.(item, column, event);
    }, []);
    /** Moves the roving tab stop to `index` and puts DOM focus on that row. */
    const focusRow = React.useCallback((index) => {
        const clamped = Math.max(0, Math.min(items.length - 1, index));
        setFocusedIndex(clamped);
        const target = bodyRef.current?.querySelector(`[data-index="${clamped}"]`);
        target?.focus();
    }, [items.length]);
    /**
     * Keyboard equivalents for everything the pointer can do (WCAG 2.1.1).
     *
     * Arrow keys move between rows, Home/End jump to the ends, Space and Enter
     * select, Enter also opens, and holding Shift while arrowing extends the
     * selection the same way Shift-click does.
     */
    const handleRowKeyDown = React.useCallback((item, index, event) => {
        const { items: liveItems, onSelectionChange: liveOnChange, onItemOpen: liveOnOpen, } = latestRef.current;
        const move = (nextIndex) => {
            event.preventDefault();
            const clamped = Math.max(0, Math.min(liveItems.length - 1, nextIndex));
            focusRow(clamped);
            const target = liveItems[clamped];
            if (!target)
                return;
            if (event.shiftKey) {
                // Extend from the anchor, exactly as Shift-click does.
                const anchorId = anchorIdRef.current ?? target.id;
                const anchorIndex = liveItems.findIndex((candidate) => candidate.id === anchorId);
                const start = Math.min(anchorIndex === -1 ? clamped : anchorIndex, clamped);
                const end = Math.max(anchorIndex === -1 ? clamped : anchorIndex, clamped);
                const rangeIds = liveItems.slice(start, end + 1).map((candidate) => candidate.id);
                liveOnChange?.([...new Set([...baseSelectionRef.current, ...rangeIds])]);
                return;
            }
            // Plain arrow movement selects the row it lands on, which is how
            // Finder behaves and keeps selection and focus in step.
            anchorIdRef.current = target.id;
            baseSelectionRef.current = [target.id];
            liveOnChange?.([target.id]);
        };
        switch (event.key) {
            case 'ArrowDown':
                move(index + 1);
                break;
            case 'ArrowUp':
                move(index - 1);
                break;
            case 'Home':
                move(0);
                break;
            case 'End':
                move(liveItems.length - 1);
                break;
            case ' ':
                event.preventDefault();
                anchorIdRef.current = item.id;
                baseSelectionRef.current = [item.id];
                liveOnChange?.([item.id]);
                break;
            case 'Enter':
                event.preventDefault();
                liveOnChange?.([item.id]);
                liveOnOpen?.(item);
                break;
        }
    }, [focusRow]);
    // Keep the tab stop in range when the list shrinks.
    React.useEffect(() => {
        setFocusedIndex((current) => Math.max(0, Math.min(items.length - 1, current)));
    }, [items.length]);
    // Container style
    const containerStyle = {};
    if (height !== 'auto') {
        containerStyle.height = typeof height === 'number' ? `${height}px` : height;
    }
    // Whether the body is currently rendering rows rather than a placeholder.
    const hasRows = !loading && items.length > 0;
    const renderBody = () => {
        if (loading) {
            return (jsxRuntime.jsx("div", { className: mergeClasses(styles$1.placeholder, classes?.loading), children: loadingState }));
        }
        if (items.length === 0) {
            return jsxRuntime.jsx("div", { className: mergeClasses(styles$1.placeholder, classes?.empty), children: emptyState });
        }
        return items.map((item, rowIndex) => (jsxRuntime.jsx(ListViewRow, { item: item, columns: columns, columnStyles: columnStyles, rowIndex: rowIndex, isSelected: selectedSet.has(item.id), isHovered: hoveredRow === item.id, isFocusable: rowIndex === focusedIndex, rowId: `${baseId}-row-${rowIndex}`, hoveredColumnKey: hoveredRow === item.id ? hoveredColumnKey : null, classes: classes, onRowKeyDown: handleRowKeyDown, onRowClick: handleRowClick, onRowDoubleClick: handleRowDoubleClick, onRowEnter: handleRowEnter, onRowLeave: handleRowLeave, onCellEnter: handleCellEnter, onCellLeave: handleCellLeave, onCellClickInternal: handleCellClickInternal, renderRow: renderRow, renderCell: renderCell }, item.id)));
    };
    return (jsxRuntime.jsxs("div", { ref: ref, className: classNames, style: containerStyle, children: [jsxRuntime.jsx("div", { className: mergeClasses(styles$1.header, classes?.header), children: columns.map((column, columnIndex) => {
                    const isSorted = sortColumn === column.key;
                    const headerState = {
                        isSorted,
                        sortDirection: isSorted ? sortDirection : undefined,
                    };
                    const sortable = column.sortable !== false;
                    const headerDefaultProps = {
                        key: column.key,
                        className: mergeClasses(styles$1.headerCell, sortable && styles$1.sortable, classes?.headerCell),
                        style: columnStyles[columnIndex] ?? {},
                        onClick: () => handleColumnClick(column.key, column.sortable),
                        // A sortable header is a control, so it must be reachable and
                        // operable from the keyboard.
                        //
                        // Sort state goes into the accessible name rather than
                        // `aria-sort`: that attribute is only valid on
                        // columnheader, rowheader and row, and these headers are
                        // buttons in a flex strip, not table cells. On a button it
                        // is invalid ARIA and is announced to nobody.
                        role: sortable ? 'button' : undefined,
                        tabIndex: sortable ? 0 : undefined,
                        'aria-label': sortable
                            ? isSorted
                                ? `${column.label}, sorted ${sortDirection === 'asc' ? 'ascending' : 'descending'}`
                                : `${column.label}, sortable`
                            : undefined,
                        onKeyDown: sortable
                            ? (event) => {
                                if (event.key !== 'Enter' && event.key !== ' ')
                                    return;
                                event.preventDefault();
                                handleColumnClick(column.key, column.sortable);
                            }
                            : undefined,
                        'data-column': column.key,
                        'data-sortable': sortable,
                        ...(isSorted && {
                            'data-sorted': true,
                            'data-sort-direction': sortDirection,
                        }),
                    };
                    // Custom render owns the element, so it also owns the key.
                    if (renderHeaderCell) {
                        return (jsxRuntime.jsx(React.Fragment, { children: renderHeaderCell(column, headerState, headerDefaultProps) }, column.key));
                    }
                    // `key` comes off the props object and onto the element itself.
                    const { key: _key, ...headerElementProps } = headerDefaultProps;
                    return (jsxRuntime.jsxs("div", { ...headerElementProps, children: [column.label, isSorted && (jsxRuntime.jsx("span", { className: styles$1.sortIndicator, children: sortDirection === 'asc' ? '▲' : '▼' }))] }, column.key));
                }) }), jsxRuntime.jsx("div", { ref: bodyRef, className: mergeClasses(styles$1.body, classes?.body), 
                // A multi-selectable listbox: rows are its options. This also gives
                // the scroll container keyboard access, which a plain scrollable
                // <div> of non-focusable rows does not have.
                //
                // The role is dropped while the list is empty or loading: a
                // listbox is required to contain options, and applying it to a
                // box holding only a placeholder is invalid ARIA.
                role: hasRows ? 'listbox' : undefined, "aria-multiselectable": hasRows ? true : undefined, "aria-label": hasRows && !resolvedAriaLabelledBy ? resolvedAriaLabel : undefined, "aria-labelledby": hasRows ? resolvedAriaLabelledBy : undefined, "aria-busy": loading || undefined, children: renderBody() })] }));
}
/**
 * `forwardRef` erases generics, so the forwarded component is re-cast to a
 * signature that keeps `TItem`. This is what lets `<ListView<FileRow> …>`
 * infer the row type in `renderCell`, `onItemOpen` and friends.
 */
const ListView = React.forwardRef(ListViewInner);
ListView.displayName = 'ListView';

var styles = {"folderListContent":"FolderList-module_folderListContent","listView":"FolderList-module_listView"};

/**
 * Default Finder-style columns. Declared at module scope so the default keeps
 * a stable identity between renders — an inline literal would allocate a new
 * array every render and invalidate ListView's memoised column styles.
 */
const DEFAULT_COLUMNS = [
    { key: 'name', label: 'Name', width: '40%' },
    { key: 'modified', label: 'Date Modified', width: '30%' },
    { key: 'size', label: 'Size', width: '30%' },
];
/**
 * Mac OS 9 style FolderList component
 *
 * Window with integrated ListView for browsing files and folders.
 * Similar to Finder list view in Mac OS 9.
 *
 * @example
 * ```tsx
 * // Basic folder list
 * <FolderList
 *   title="My Documents"
 *   items={[
 *     { id: '1', name: 'Document.txt', modified: 'Today', size: '2 KB', icon: <FileIcon /> },
 *     { id: '2', name: 'Images', modified: 'Yesterday', size: '--', icon: <FolderIcon /> }
 *   ]}
 *   selectedIds={['1']}
 *   onSelectionChange={(ids) => console.log('Selected:', ids)}
 *   onItemOpen={(item) => console.log('Open:', item.name)}
 * />
 *
 * // Draggable folder list
 * <FolderList
 *   title="My Documents"
 *   items={items}
 *   draggable
 *   defaultPosition={{ x: 100, y: 100 }}
 * />
 * ```
 */
function FolderListInner({ columns = DEFAULT_COLUMNS, items, selectedIds, onSelectionChange, onItemOpen, onItemMouseEnter, onItemMouseLeave, onSort, onMouseEnter, listHeight = 400, classes, emptyState, loading, loadingState, renderRow, renderCell, renderHeaderCell, onCellClick, onCellMouseEnter, onCellMouseLeave, ...windowProps }, ref) {
    // Build ListView classes from FolderList classes
    const listViewClasses = classes
        ? {
            root: classes.listView,
            header: classes.header,
            headerCell: classes.headerCell,
            body: classes.body,
            row: classes.row,
            cell: classes.cell,
        }
        : undefined;
    // Window content with ListView
    return (jsxRuntime.jsx(Window, { ref: ref, contentClassName: styles.folderListContent, onMouseEnter: onMouseEnter, className: classes?.root, ...windowProps, children: jsxRuntime.jsx(ListView, { columns: columns, items: items, selectedIds: selectedIds, onSelectionChange: onSelectionChange, onItemOpen: onItemOpen, onItemMouseEnter: onItemMouseEnter, onItemMouseLeave: onItemMouseLeave, onSort: onSort, height: listHeight, className: styles.listView, classes: listViewClasses, emptyState: emptyState, loading: loading, loadingState: loadingState, renderRow: renderRow, renderCell: renderCell, renderHeaderCell: renderHeaderCell, onCellClick: onCellClick, onCellMouseEnter: onCellMouseEnter, onCellMouseLeave: onCellMouseLeave }) }));
}
/**
 * `forwardRef` erases generics, so the forwarded component is re-cast to a
 * signature that keeps `TItem` — matching how ListView is exported.
 */
const FolderList = React.forwardRef(FolderListInner);
FolderList.displayName = 'FolderList';

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
const colors = {
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
};
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
const typography = {
    fontFamily: {
        // Primary system UI font. Mirrors --font-system: the bundled Pixel
        // bitmap face, falling back through system UI sans stacks.
        system: "'Pixel', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
        // Body text. Mirrors --font-body. IBM Plex Sans is only present when
        // the consumer opts in to '@liiift-studio/mac-os9-ui/webfonts'.
        body: "'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
        // Display / headline face. Mirrors --font-display.
        display: "'Pixel', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
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
        sm: '0.625rem', // 10px - small labels
        md: '0.75rem', // 12px - standard UI text (Mac OS 9 default)
        lg: '0.8125rem', // 13px - slightly larger UI text
        xl: '0.875rem', // 14px - large UI text
        '2xl': '1rem', // 16px - headings
        '3xl': '1.125rem', // 18px - large headings
        '4xl': '1.25rem', // 20px - major headings
        '5xl': '1.5rem', // 24px - display text
    },
    // The bundled Pixel family ships exactly two real weights, 400 and 700, in
    // both roman and italic, so nothing here is ever synthesised by the browser.
    // `normal` is 700 on purpose: Mac OS 9's Charcoal reads as bold, and
    // matching it is the point of the library. Use `regular` for the 400 face.
    fontWeight: {
        regular: 400, // Pixel Regular - the true 400 face
        light: 400, // Alias of regular; Pixel has no lighter face
        normal: 700, // Charcoal-like bold - Mac OS 9 UI default
        medium: 700, // No real 500 face; resolves to bold
        semibold: 700, // No real 600 face; resolves to bold
        bold: 700, // Pixel Bold - the true 700 face
    },
    lineHeight: {
        tight: 1.2, // Tight leading (Mac OS 9 style)
        snug: 1.3, // Snug
        normal: 1.4, // Normal (Mac OS 9 used tighter line heights)
        relaxed: 1.5, // Relaxed
        loose: 1.6, // Loose
    },
    letterSpacing: {
        tighter: '-0.02em', // Slightly tighter
        tight: '-0.01em', // Tight
        normal: '0', // Normal - Mac OS 9 default
        wide: '0.01em', // Wide
        wider: '0.02em', // Wider
    },
};
/**
 * Spacing tokens based on Mac OS 9 measurements
 * Mac OS 9 used tight spacing; using 2px as base unit
 */
const spacing = {
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
};
/**
 * Shadow tokens for Mac OS 9 bevel effects
 * Exact values from Figma Window Shadow effect (67:95038)
 *
 * Classic 3-layer bevel:
 * 1. Hard drop shadow (2px, 2px, 0 blur) - creates depth
 * 2. Top-left highlight (light inner shadow)
 * 3. Bottom-right shadow (dark inner shadow)
 */
const shadows = {
    // Standard raised bevel (default button state)
    bevel: 'inset 2px 2px 0 rgba(255, 255, 255, 0.6), inset -2px -2px 0 rgba(38, 38, 38, 0.4), 2px 2px 0 rgba(38, 38, 38, 1)',
    // Inverted bevel for pressed/inset states
    inset: 'inset -2px -2px 0 rgba(255, 255, 255, 0.6), inset 2px 2px 0 rgba(38, 38, 38, 0.4), inset 0px 0px 0px rgba(38, 38, 38, 1)',
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
};
/**
 * Border tokens
 * Mac OS 9 used consistent 1px borders with sharp corners
 */
const borders = {
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
};
/**
 * Z-index scale for layering
 */
const zIndex = {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1200,
    popover: 1300,
    tooltip: 1400,
};
/**
 * Transition/Animation tokens
 * Mac OS 9 had minimal animations, but we add subtle ones for modern feel
 */
const transitions = {
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
};
// Export all tokens as a single object
const tokens = {
    colors,
    typography,
    spacing,
    borders,
    shadows,
    zIndex,
    transitions,
};

exports.AlertIcon = AlertIcon;
exports.ApplicationIcon = ApplicationIcon;
exports.ArrowDownIcon = ArrowDownIcon;
exports.ArrowLeftIcon = ArrowLeftIcon;
exports.ArrowRightIcon = ArrowRightIcon;
exports.ArrowUpIcon = ArrowUpIcon;
exports.Button = Button;
exports.CalendarIcon = CalendarIcon;
exports.CheckIcon = CheckIcon;
exports.Checkbox = Checkbox;
exports.ChevronDownIcon = ChevronDownIcon;
exports.ChevronRightIcon = ChevronRightIcon;
exports.CloseIcon = CloseIcon;
exports.CopyIcon = CopyIcon;
exports.Dialog = Dialog;
exports.DiskIcon = DiskIcon;
exports.DividerIcon = DividerIcon;
exports.DocumentIcon = DocumentIcon;
exports.DownloadIcon = DownloadIcon;
exports.ErrorIcon = ErrorIcon;
exports.FolderIcon = FolderIcon;
exports.FolderList = FolderList;
exports.FolderOpenIcon = FolderOpenIcon;
exports.GrabberIcon = GrabberIcon;
exports.HardDriveIcon = HardDriveIcon;
exports.HomeIcon = HomeIcon;
exports.Icon = Icon;
exports.IconButton = IconButton;
exports.IconLibrary = IconLibrary;
exports.ImageIcon = ImageIcon;
exports.InfoIcon = InfoIcon;
exports.LinkIcon = LinkIcon;
exports.ListView = ListView;
exports.LockIcon = LockIcon;
exports.MailIcon = MailIcon;
exports.MenuBar = MenuBar;
exports.MenuDropdown = MenuDropdown;
exports.MenuItem = MenuItem;
exports.MusicIcon = MusicIcon;
exports.PauseIcon = PauseIcon;
exports.PlayIcon = PlayIcon;
exports.PrintIcon = PrintIcon;
exports.QuestionIcon = QuestionIcon;
exports.Radio = Radio;
exports.RadioGroup = RadioGroup;
exports.ResizeHandleIcon = ResizeHandleIcon;
exports.Scrollbar = Scrollbar;
exports.SearchIcon = SearchIcon;
exports.Select = Select;
exports.StopIcon = StopIcon;
exports.TabPanel = TabPanel;
exports.Tabs = Tabs;
exports.TextField = TextField;
exports.TrashIcon = TrashIcon;
exports.UserIcon = UserIcon;
exports.VolumeIcon = VolumeIcon;
exports.VolumeMuteIcon = VolumeMuteIcon;
exports.Window = Window;
exports.WindowManagerProvider = WindowManagerProvider;
exports.borders = borders;
exports.clamp = clamp;
exports.colors = colors;
exports.createClassBuilder = createClassBuilder;
exports.createPixelIcon = createPixelIcon;
exports.getAllIconNames = getAllIconNames;
exports.getIcon = getIcon;
exports.hasIcon = hasIcon;
exports.iconRegistry = iconRegistry;
exports.measureContainingBlock = measureContainingBlock;
exports.measureOffset = measureOffset;
exports.mergeClasses = mergeClasses;
exports.shadows = shadows;
exports.spacing = spacing;
exports.tokens = tokens;
exports.transitions = transitions;
exports.typography = typography;
exports.useDraggable = useDraggable;
exports.useMenuPosition = useMenuPosition;
exports.useOutsideClick = useOutsideClick;
exports.usePointerGesture = usePointerGesture;
exports.useResizable = useResizable;
exports.useWindowManager = useWindowManager;
exports.zIndex = zIndex;
