"use client";
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import React, { forwardRef, useId, useState, useCallback, useRef, Children, isValidElement, useEffect, useLayoutEffect } from 'react';

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
    const scheme = match[1].toLowerCase();
    if (SAFE_URL_SCHEMES.includes(scheme)) {
        return trimmed;
    }
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
        console.warn(`[@liiift-studio/mac-os9-ui] Refused unsafe URL scheme "${scheme}:" in href. ` +
            `Allowed schemes: ${SAFE_URL_SCHEMES.join(', ')}, plus relative URLs.`);
    }
    return undefined;
}

var styles$e = {"button":"Button-module_button","button--sm":"Button-module_button--sm","button--md":"Button-module_button--md","button--lg":"Button-module_button--lg","button--default":"Button-module_button--default","button--primary":"Button-module_button--primary","button--danger":"Button-module_button--danger","button--disabled":"Button-module_button--disabled","button--full-width":"Button-module_button--full-width","button--loading":"Button-module_button--loading","button--cursor-loading":"Button-module_button--cursor-loading","button__loading-spinner":"Button-module_button__loading-spinner","button__text":"Button-module_button__text","button__icon-left":"Button-module_button__icon-left","button__icon-right":"Button-module_button__icon-right","button__icon-only":"Button-module_button__icon-only","button--icon-only":"Button-module_button--icon-only"};

/**
 * Mac OS 9 style Button component
 *
 * Polymorphic component that can render as button or link with consistent styling.
 *
 * Features:
 * - Classic 3-layer bevel effect (highlight, shadow, drop shadow)
 * - Polymorphic - renders as <button> or <a> based on `as` prop
 * - Loading states with optional Mac OS 9 watch cursor
 * - Icon support (left, right, or icon-only)
 * - Full accessibility with ARIA support
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
 * // With icons
 * <Button leftIcon={<FolderIcon />}>Open</Button>
 * <Button iconOnly aria-label="Close">
 *   <CloseIcon />
 * </Button>
 * ```
 */
const Button = forwardRef((props, ref) => {
    const { variant = 'default', size = 'md', disabled = false, fullWidth = false, loading = false, loadingText, useCursorLoading = false, leftIcon, rightIcon, iconOnly = false, ariaLabel, ariaDescribedBy, ariaPressed, className = '', children, ...restProps } = props;
    // Determine if rendering as link
    const isLink = props.as === 'a';
    // Build class names
    const classNames = [
        styles$e.button,
        styles$e[`button--${variant}`],
        styles$e[`button--${size}`],
        fullWidth && styles$e['button--full-width'],
        disabled && styles$e['button--disabled'],
        loading && styles$e['button--loading'],
        loading && useCursorLoading && styles$e['button--cursor-loading'],
        iconOnly && styles$e['button--icon-only'],
        (leftIcon || rightIcon) && styles$e['button--with-icon'],
        className,
    ]
        .filter(Boolean)
        .join(' ');
    // Prepare ARIA attributes
    const ariaAttributes = {
        'aria-label': iconOnly ? (ariaLabel || (typeof children === 'string' ? children : undefined)) : ariaLabel,
        'aria-describedby': ariaDescribedBy,
        'aria-pressed': ariaPressed,
        'aria-disabled': disabled || loading,
        'aria-busy': loading,
    };
    // Handle link-specific props
    if (isLink) {
        const { href, target, rel, download, ...linkProps } = restProps;
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
        // Links can't be truly disabled, so prevent default
        const handleClick = (e) => {
            if (disabled || loading) {
                e.preventDefault();
                return;
            }
            linkProps.onClick?.(e);
        };
        return (jsx("a", { ref: ref, href: disabled || loading ? undefined : safeHref, target: target, rel: finalRel, download: download, className: classNames, ...ariaAttributes, ...linkProps, onClick: handleClick, children: renderButtonContent() }));
    }
    // Handle button-specific props
    const { type = 'button', form, formAction, formMethod, formNoValidate, formTarget, ...buttonProps } = restProps;
    return (jsx("button", { ref: ref, type: type, disabled: disabled || loading, form: form, formAction: formAction, formMethod: formMethod, formNoValidate: formNoValidate, formTarget: formTarget, className: classNames, ...ariaAttributes, ...buttonProps, children: renderButtonContent() }));
    // Render button content with icons and loading state
    function renderButtonContent() {
        // Show loading state
        if (loading) {
            return (jsxs(Fragment, { children: [!useCursorLoading && (jsx("span", { className: styles$e['button__loading-spinner'], "aria-hidden": "true", children: "\u23F3" })), jsx("span", { className: styles$e['button__text'], children: loadingText || children })] }));
        }
        // Icon-only button
        if (iconOnly) {
            return jsx("span", { className: styles$e['button__icon-only'], children: children });
        }
        // Button with icons
        return (jsxs(Fragment, { children: [leftIcon && (jsx("span", { className: styles$e['button__icon-left'], "aria-hidden": "true", children: leftIcon })), jsx("span", { className: styles$e['button__text'], children: children }), rightIcon && (jsx("span", { className: styles$e['button__icon-right'], "aria-hidden": "true", children: rightIcon }))] }));
    }
});
Button.displayName = 'Button';

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
const Icon = forwardRef(({ size = 'md', children, label, className = '', ...props }, ref) => {
    const classNames = [styles$d.icon, styles$d[`icon--${size}`], className]
        .filter(Boolean)
        .join(' ');
    return (jsx("svg", { ref: ref, className: classNames, viewBox: "0 0 24 24", fill: "currentColor", xmlns: "http://www.w3.org/2000/svg", "aria-label": label, "aria-hidden": !label, role: label ? 'img' : 'presentation', ...props, children: children }));
});
Icon.displayName = 'Icon';

/**
 * Divider icon
 * Vertical divider for menu bars and toolbars
 * Note: Uses a 10x32 viewBox instead of standard 24x24
 */
const DividerIcon = () => (jsxs(Icon, { label: "Divider", size: "sm", viewBox: "0 0 10 32", children: [jsxs("g", { clipPath: "url(#clip0_529_36832)", children: [jsx("path", { d: "M8 4H10V32H8V4Z", fill: "#999999" }), jsx("path", { d: "M8 0H10V4H8V0Z", fill: "#999999" }), jsx("path", { d: "M0 4H2V32H0V4Z", fill: "white" }), jsx("path", { d: "M0 0H2V4H0V0Z", fill: "white" }), jsx("path", { d: "M5 28H7V30H5V28Z", fill: "#BBBBBB" }), jsx("path", { d: "M5 21H7V23H5V21Z", fill: "#BBBBBB" }), jsx("path", { d: "M5 14H7V16H5V14Z", fill: "#BBBBBB" }), jsx("path", { d: "M5 7H7V9H5V7Z", fill: "#BBBBBB" }), jsx("path", { d: "M5 4H7V2H5V4Z", fill: "#BBBBBB" }), jsx("path", { d: "M5 30H7V32H5V30Z", fill: "white" }), jsx("path", { d: "M5 23H7V25H5V23Z", fill: "white" }), jsx("path", { d: "M5 16H7V18H5V16Z", fill: "white" }), jsx("path", { d: "M5 9H7V11H5V9Z", fill: "white" }), jsx("path", { d: "M5 2H7V0H5V2Z", fill: "white" }), jsx("path", { d: "M3 28H5V30H3V28Z", fill: "#999999" }), jsx("path", { d: "M3 21H5V23H3V21Z", fill: "#999999" }), jsx("path", { d: "M3 14H5V16H3V14Z", fill: "#999999" }), jsx("path", { d: "M3 7H5V9H3V7Z", fill: "#999999" }), jsx("path", { d: "M3 4H5V2H3V4Z", fill: "#999999" }), jsx("path", { d: "M3 30H5V32H3V30Z", fill: "#BBBBBB" }), jsx("path", { d: "M3 23H5V25H3V23Z", fill: "#BBBBBB" }), jsx("path", { d: "M3 16H5V18H3V16Z", fill: "#BBBBBB" }), jsx("path", { d: "M3 9H5V11H3V9Z", fill: "#BBBBBB" }), jsx("path", { d: "M3 2H5V0H3V2Z", fill: "#BBBBBB" })] }), jsx("defs", { children: jsx("clipPath", { id: "clip0_529_36832", children: jsx("rect", { width: "10", height: "32", fill: "white" }) }) })] }));

// Icon Registry - Mac OS 9 React UI
// Central registry of all available icons with type-safe names
/**
 * Central icon registry
 * Maps icon names to their components
 */
const iconRegistry = {
    // UI
    divider: DividerIcon,
};
/**
 * Get icon component by name
 * @param name - The icon name from the registry
 * @returns The icon component or undefined if not found
 */
function getIcon(name) {
    return iconRegistry[name];
}

/**
 * IconLibrary component for Mac OS 9 UI
 *
 * Provides a convenient way to use icons by name rather than importing each one individually.
 * All icons are registered in the icon registry and can be accessed by their string names.
 *
 * @example
 * ```tsx
 * <IconLibrary icon="save" size="md" />
 * <IconLibrary icon="folder" size="lg" />
 * <IconLibrary icon="arrow-right" size="sm" />
 * ```
 */
const IconLibrary = ({ icon, ...props }) => {
    const IconComponent = getIcon(icon);
    if (!IconComponent) {
        console.warn(`Icon "${icon}" not found in registry`);
        return null;
    }
    // Render the icon component with any additional props
    return jsx(IconComponent, { ...props });
};
IconLibrary.displayName = 'IconLibrary';

var styles$c = {"pixelated-corner-sm":"IconButton-module_pixelated-corner-sm","pixelated-corner-md":"IconButton-module_pixelated-corner-md","pixelated-corner-pseudo":"IconButton-module_pixelated-corner-pseudo","mac-corner":"IconButton-module_mac-corner","chamfered-sm":"IconButton-module_chamfered-sm","chamfered-md":"IconButton-module_chamfered-md","tab-corner":"IconButton-module_tab-corner","button-corner":"IconButton-module_button-corner","window-corner":"IconButton-module_window-corner","iconButton":"IconButton-module_iconButton","icon":"IconButton-module_icon","label":"IconButton-module_label","iconButton--label-top":"IconButton-module_iconButton--label-top","iconButton--label-bottom":"IconButton-module_iconButton--label-bottom","iconButton--label-left":"IconButton-module_iconButton--label-left","iconButton--label-right":"IconButton-module_iconButton--label-right","iconButton--sm":"IconButton-module_iconButton--sm","iconButton--with-label":"IconButton-module_iconButton--with-label","iconButton--md":"IconButton-module_iconButton--md","iconButton--lg":"IconButton-module_iconButton--lg","iconButton--default":"IconButton-module_iconButton--default","iconButton--primary":"IconButton-module_iconButton--primary","iconButton--danger":"IconButton-module_iconButton--danger","iconButton--disabled":"IconButton-module_iconButton--disabled"};

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
const IconButton = forwardRef(({ icon, label, labelPosition = 'right', variant = 'default', size = 'md', disabled = false, className = '', ...props }, ref) => {
    // Build class names
    const classNames = [
        styles$c.iconButton,
        styles$c[`iconButton--${variant}`],
        styles$c[`iconButton--${size}`],
        label && styles$c['iconButton--with-label'],
        label && styles$c[`iconButton--label-${labelPosition}`],
        disabled && styles$c['iconButton--disabled'],
        className,
    ]
        .filter(Boolean)
        .join(' ');
    return (jsxs("button", { ref: ref, type: "button", className: classNames, disabled: disabled, ...props, children: [label && (labelPosition === 'left' || labelPosition === 'top') && (jsx("span", { className: styles$c.label, children: label })), jsx("span", { className: styles$c.icon, children: icon }), label && (labelPosition === 'right' || labelPosition === 'bottom') && (jsx("span", { className: styles$c.label, children: label }))] }));
});
IconButton.displayName = 'IconButton';

var styles$b = {"wrapper":"Checkbox-module_wrapper","wrapper--disabled":"Checkbox-module_wrapper--disabled","wrapper--error":"Checkbox-module_wrapper--error","wrapper--label-left":"Checkbox-module_wrapper--label-left","wrapper--label-right":"Checkbox-module_wrapper--label-right","checkbox":"Checkbox-module_checkbox","checkbox--sm":"Checkbox-module_checkbox--sm","checkbox--md":"Checkbox-module_checkbox--md","checkbox--lg":"Checkbox-module_checkbox--lg","checkbox--indeterminate":"Checkbox-module_checkbox--indeterminate","checkbox--error":"Checkbox-module_checkbox--error","label":"Checkbox-module_label","label--sm":"Checkbox-module_label--sm","label--md":"Checkbox-module_label--md","label--lg":"Checkbox-module_label--lg","wrapper--sm":"Checkbox-module_wrapper--sm","wrapper--md":"Checkbox-module_wrapper--md","wrapper--lg":"Checkbox-module_wrapper--lg"};

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
const Checkbox = forwardRef(({ checked, defaultChecked, indeterminate = false, disabled = false, label, labelPosition = 'right', size = 'md', error = false, ariaLabel, ariaDescribedBy, className = '', onChange, id, ...props }, ref) => {
    const inputRef = React.useRef(null);
    const combinedRef = ref || inputRef;
    // Set indeterminate property via ref (can't be set via HTML attribute)
    React.useEffect(() => {
        if (combinedRef?.current) {
            combinedRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate, combinedRef]);
    // Generate ID if not provided (for label association)
    const checkboxId = id || React.useId();
    // Build class names
    const wrapperClassNames = [
        styles$b.wrapper,
        styles$b[`wrapper--${size}`],
        styles$b[`wrapper--label-${labelPosition}`],
        disabled && styles$b['wrapper--disabled'],
        error && styles$b['wrapper--error'],
        className,
    ]
        .filter(Boolean)
        .join(' ');
    const checkboxClassNames = [
        styles$b.checkbox,
        styles$b[`checkbox--${size}`],
        indeterminate && styles$b['checkbox--indeterminate'],
        error && styles$b['checkbox--error'],
    ]
        .filter(Boolean)
        .join(' ');
    const labelClassNames = [styles$b.label, styles$b[`label--${size}`]].filter(Boolean).join(' ');
    // ARIA attributes
    //
    // Note: we deliberately do NOT set `aria-checked`. Per ARIA 1.2,
    // `aria-checked` cannot be used on a native <input type="checkbox">
    // — the host language already exposes the checked state. The
    // tri-state ("mixed") indicator is the DOM `indeterminate` property,
    // which the effect above sets on the input via ref.
    const ariaAttributes = {
        'aria-label': !label ? ariaLabel : undefined,
        'aria-describedby': ariaDescribedBy,
        'aria-invalid': error,
    };
    return (jsxs("div", { className: wrapperClassNames, children: [label && labelPosition === 'left' && (jsx("label", { htmlFor: checkboxId, className: labelClassNames, children: label })), jsx("input", { ref: combinedRef, type: "checkbox", id: checkboxId, className: checkboxClassNames, checked: checked, defaultChecked: defaultChecked, disabled: disabled, onChange: onChange, ...ariaAttributes, ...props }), label && labelPosition === 'right' && (jsx("label", { htmlFor: checkboxId, className: labelClassNames, children: label }))] }));
});
Checkbox.displayName = 'Checkbox';

var styles$a = {"wrapper":"Radio-module_wrapper","wrapper--disabled":"Radio-module_wrapper--disabled","wrapper--error":"Radio-module_wrapper--error","wrapper--label-left":"Radio-module_wrapper--label-left","wrapper--label-right":"Radio-module_wrapper--label-right","radio":"Radio-module_radio","radio--sm":"Radio-module_radio--sm","radio--md":"Radio-module_radio--md","radio--lg":"Radio-module_radio--lg","radio--error":"Radio-module_radio--error","label":"Radio-module_label","label--sm":"Radio-module_label--sm","label--md":"Radio-module_label--md","label--lg":"Radio-module_label--lg","wrapper--sm":"Radio-module_wrapper--sm","wrapper--md":"Radio-module_wrapper--md","wrapper--lg":"Radio-module_wrapper--lg"};

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
 * <RadioGroup name="size" value={size} onChange={setSize}>
 *   <Radio value="small" label="Small" />
 *   <Radio value="medium" label="Medium" />
 *   <Radio value="large" label="Large" />
 * </RadioGroup>
 *
 * // Standalone (legacy) still works
 * <Radio name="color" value="red" label="Red" />
 * ```
 */
const Radio = forwardRef(({ checked, defaultChecked, disabled = false, label, labelPosition = 'right', size = 'md', error = false, ariaLabel, ariaDescribedBy, className = '', value, name, onChange, id, ...props }, ref) => {
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
    const generatedId = useId();
    const radioId = id || generatedId;
    // Build class names
    const wrapperClassNames = [
        styles$a.wrapper,
        styles$a[`wrapper--${size}`],
        styles$a[`wrapper--label-${labelPosition}`],
        resolvedDisabled && styles$a['wrapper--disabled'],
        error && styles$a['wrapper--error'],
        className,
    ]
        .filter(Boolean)
        .join(' ');
    const radioClassNames = [
        styles$a.radio,
        styles$a[`radio--${size}`],
        error && styles$a['radio--error'],
    ]
        .filter(Boolean)
        .join(' ');
    const labelClassNames = [styles$a.label, styles$a[`label--${size}`]].filter(Boolean).join(' ');
    // ARIA attributes
    const ariaAttributes = {
        'aria-label': !label ? ariaLabel : undefined,
        'aria-describedby': ariaDescribedBy,
        'aria-invalid': error,
    };
    return (jsxs("div", { className: wrapperClassNames, children: [label && labelPosition === 'left' && (jsx("label", { htmlFor: radioId, className: labelClassNames, children: label })), jsx("input", { ref: ref, type: "radio", id: radioId, className: radioClassNames, checked: group ? resolvedChecked : checked, defaultChecked: group ? undefined : defaultChecked, disabled: resolvedDisabled, value: value, name: resolvedName, onChange: handleInputChange, ...ariaAttributes, ...props }), label && labelPosition === 'right' && (jsx("label", { htmlFor: radioId, className: labelClassNames, children: label }))] }));
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
 * <RadioGroup name="size" value={size} onChange={setSize} ariaLabel="T-shirt size">
 *   <Radio value="small" label="Small" />
 *   <Radio value="medium" label="Medium" />
 *   <Radio value="large" label="Large" />
 * </RadioGroup>
 * ```
 */
const RadioGroup = forwardRef(({ name, value, defaultValue, onChange, disabled = false, orientation = 'vertical', ariaLabel, ariaLabelledBy, className = '', children, }, ref) => {
    const generatedName = useId();
    const resolvedName = name ?? `radio-group-${generatedName}`;
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = isControlled ? value : internalValue;
    const handleChildChange = useCallback((nextValue) => {
        if (!isControlled)
            setInternalValue(nextValue);
        onChange?.(nextValue);
    }, [isControlled, onChange]);
    // Arrow-key navigation. We scope the listener to the group root and
    // query enabled radios on demand so consumers can render any structure
    // inside (Radio wrapped in extra divs is fine).
    const groupRef = useRef(null);
    const setGroupRef = useCallback((node) => {
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
        target.focus();
        // Selecting on arrow move matches the WAI-ARIA radiogroup pattern
        // for automatic activation. The synthetic ChangeEvent piggybacks
        // onto `change` so the consumer's onChange fires once.
        target.checked = true;
        target.dispatchEvent(new Event('change', { bubbles: true }));
    };
    const contextValue = {
        name: resolvedName,
        value: currentValue,
        disabled,
        onChange: (nextValue) => handleChildChange(nextValue),
    };
    return (jsx("div", { ref: setGroupRef, role: "radiogroup", "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, "aria-orientation": orientation, "aria-disabled": disabled || undefined, onKeyDown: handleKeyDown, className: className, children: jsx(RadioGroupContext.Provider, { value: contextValue, children: children }) }));
});
RadioGroup.displayName = 'RadioGroup';

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
const TextField = forwardRef(({ label, labelPosition = 'top', size = 'md', fullWidth = false, error = false, errorMessage, helperText, leftIcon, rightIcon, ariaLabel, ariaDescribedBy, className = '', wrapperClassName = '', type = 'text', id, disabled, ...props }, ref) => {
    // Generate ID if not provided (for label association)
    const inputId = id || React.useId();
    // Generate helper/error text ID for aria-describedby
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    // Combine aria-describedby
    const describedByIds = [
        helperText && helperId,
        error && errorMessage && errorId,
        ariaDescribedBy,
    ]
        .filter(Boolean)
        .join(' ');
    // Build class names
    const wrapperClassNames = [
        styles$9.wrapper,
        styles$9[`wrapper--${size}`],
        styles$9[`wrapper--label-${labelPosition}`],
        fullWidth && styles$9['wrapper--full-width'],
        disabled && styles$9['wrapper--disabled'],
        wrapperClassName,
    ]
        .filter(Boolean)
        .join(' ');
    const inputWrapperClassNames = [
        styles$9['input-wrapper'],
        (leftIcon || rightIcon) && styles$9['input-wrapper--with-icon'],
        leftIcon && styles$9['input-wrapper--with-left-icon'],
        rightIcon && styles$9['input-wrapper--with-right-icon'],
    ]
        .filter(Boolean)
        .join(' ');
    const inputClassNames = [
        styles$9.input,
        styles$9[`input--${size}`],
        error && styles$9['input--error'],
        fullWidth && styles$9['input--full-width'],
        className,
    ]
        .filter(Boolean)
        .join(' ');
    const labelClassNames = [styles$9.label, styles$9[`label--${size}`]].filter(Boolean).join(' ');
    // ARIA attributes
    const ariaAttributes = {
        'aria-label': !label ? ariaLabel : undefined,
        'aria-describedby': describedByIds || undefined,
        'aria-invalid': error,
    };
    return (jsxs("div", { className: wrapperClassNames, children: [label && (labelPosition === 'top' || labelPosition === 'left') && (jsx("label", { htmlFor: inputId, className: labelClassNames, children: label })), jsxs("div", { className: inputWrapperClassNames, children: [leftIcon && (jsx("span", { className: styles$9['input-icon-left'], "aria-hidden": "true", children: leftIcon })), jsx("input", { ref: ref, type: type, id: inputId, className: inputClassNames, disabled: disabled, ...ariaAttributes, ...props }), rightIcon && (jsx("span", { className: styles$9['input-icon-right'], "aria-hidden": "true", children: rightIcon }))] }), label && labelPosition === 'right' && (jsx("label", { htmlFor: inputId, className: labelClassNames, children: label })), helperText && !error && (jsx("p", { id: helperId, className: styles$9['helper-text'], children: helperText })), error && errorMessage && (jsx("p", { id: errorId, className: styles$9['error-message'], children: errorMessage }))] }));
});
TextField.displayName = 'TextField';

var styles$8 = {"wrapper":"Select-module_wrapper","wrapper--full-width":"Select-module_wrapper--full-width","wrapper--disabled":"Select-module_wrapper--disabled","wrapper--label-top":"Select-module_wrapper--label-top","wrapper--label-left":"Select-module_wrapper--label-left","wrapper--label-right":"Select-module_wrapper--label-right","label":"Select-module_label","label--sm":"Select-module_label--sm","label--md":"Select-module_label--md","label--lg":"Select-module_label--lg","select":"Select-module_select","select--sm":"Select-module_select--sm","select--md":"Select-module_select--md","select--lg":"Select-module_select--lg","select--full-width":"Select-module_select--full-width","select--error":"Select-module_select--error","helper-text":"Select-module_helper-text","error-message":"Select-module_error-message","wrapper--sm":"Select-module_wrapper--sm","wrapper--md":"Select-module_wrapper--md","wrapper--lg":"Select-module_wrapper--lg"};

/**
 * Mac OS 9 style Select component
 *
 * Classic dropdown select with raised bevel effect and optional label.
 *
 * Features:
 * - Classic Mac OS 9 popup menu styling
 * - Label positioning (top/left/right)
 * - Size variants (sm/md/lg)
 * - Error states with messages
 * - Helper text support
 * - Option groups support
 * - Full accessibility with ARIA support
 * - Keyboard navigation
 * - Form integration
 *
 * @example
 * ```tsx
 * // With options prop
 * <Select
 *   label="Choose a color"
 *   options={[
 *     { value: 'red', label: 'Red' },
 *     { value: 'blue', label: 'Blue' },
 *     { value: 'green', label: 'Green' }
 *   ]}
 *   placeholder="Select a color..."
 * />
 *
 * // With children
 * <Select label="Country">
 *   <option value="us">United States</option>
 *   <option value="ca">Canada</option>
 *   <option value="mx">Mexico</option>
 * </Select>
 * ```
 */
const Select = forwardRef(({ label, labelPosition = 'top', size = 'md', fullWidth = false, error = false, errorMessage, helperText, options, placeholder, ariaLabel, ariaDescribedBy, className = '', wrapperClassName = '', id, disabled, children, ...props }, ref) => {
    // Generate ID if not provided (for label association)
    const selectId = id || React.useId();
    // Generate helper/error text ID for aria-describedby
    const helperId = `${selectId}-helper`;
    const errorId = `${selectId}-error`;
    // Combine aria-describedby
    const describedByIds = [
        helperText && helperId,
        error && errorMessage && errorId,
        ariaDescribedBy,
    ]
        .filter(Boolean)
        .join(' ');
    // Build class names
    const wrapperClassNames = [
        styles$8.wrapper,
        styles$8[`wrapper--${size}`],
        styles$8[`wrapper--label-${labelPosition}`],
        fullWidth && styles$8['wrapper--full-width'],
        disabled && styles$8['wrapper--disabled'],
        wrapperClassName,
    ]
        .filter(Boolean)
        .join(' ');
    const selectClassNames = [
        styles$8.select,
        styles$8[`select--${size}`],
        error && styles$8['select--error'],
        fullWidth && styles$8['select--full-width'],
        className,
    ]
        .filter(Boolean)
        .join(' ');
    const labelClassNames = [styles$8.label, styles$8[`label--${size}`]].filter(Boolean).join(' ');
    // ARIA attributes
    const ariaAttributes = {
        'aria-label': !label ? ariaLabel : undefined,
        'aria-describedby': describedByIds || undefined,
        'aria-invalid': error,
    };
    // Render options from options prop
    const renderOptions = () => {
        if (options) {
            return (jsxs(Fragment, { children: [placeholder && (jsx("option", { value: "", disabled: true, children: placeholder })), options.map((option) => (jsx("option", { value: option.value, disabled: option.disabled, children: option.label }, option.value)))] }));
        }
        return children;
    };
    return (jsxs("div", { className: wrapperClassNames, children: [label && (labelPosition === 'top' || labelPosition === 'left') && (jsx("label", { htmlFor: selectId, className: labelClassNames, children: label })), jsx("select", { ref: ref, id: selectId, className: selectClassNames, disabled: disabled, ...ariaAttributes, ...props, children: renderOptions() }), label && labelPosition === 'right' && (jsx("label", { htmlFor: selectId, className: labelClassNames, children: label })), helperText && !error && (jsx("p", { id: helperId, className: styles$8['helper-text'], children: helperText })), error && errorMessage && (jsx("p", { id: errorId, className: styles$8['error-message'], children: errorMessage }))] }));
});
Select.displayName = 'Select';

var styles$7 = {"pixelated-corner-sm":"Tabs-module_pixelated-corner-sm","pixelated-corner-md":"Tabs-module_pixelated-corner-md","pixelated-corner-pseudo":"Tabs-module_pixelated-corner-pseudo","mac-corner":"Tabs-module_mac-corner","chamfered-sm":"Tabs-module_chamfered-sm","chamfered-md":"Tabs-module_chamfered-md","tab-corner":"Tabs-module_tab-corner","button-corner":"Tabs-module_button-corner","window-corner":"Tabs-module_window-corner","container":"Tabs-module_container","tabList":"Tabs-module_tabList","tabList--full-width":"Tabs-module_tabList--full-width","tab":"Tabs-module_tab","tab--active":"Tabs-module_tab--active","tab--disabled":"Tabs-module_tab--disabled","tab--sm":"Tabs-module_tab--sm","tab--md":"Tabs-module_tab--md","tab--lg":"Tabs-module_tab--lg","tab--full-width":"Tabs-module_tab--full-width","tabIcon":"Tabs-module_tabIcon","panelContainer":"Tabs-module_panelContainer","panelContainer--sm":"Tabs-module_panelContainer--sm","panelContainer--md":"Tabs-module_panelContainer--md","panelContainer--lg":"Tabs-module_panelContainer--lg"};

/**
 * TabPanel component - Individual tab content
 * Must be used as a child of Tabs component
 */
const TabPanel = ({ children }) => {
    return jsx(Fragment, { children: children });
};
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
 * <Tabs activeTab={activeIndex} onChange={setActiveIndex}>
 *   <TabPanel label="Tab 1">Content 1</TabPanel>
 *   <TabPanel label="Tab 2">Content 2</TabPanel>
 * </Tabs>
 * ```
 */
const Tabs = ({ children, defaultActiveTab = 0, activeTab: controlledActiveTab, onChange, size = 'md', fullWidth = false, className = '', tabListClassName = '', panelClassName = '', ariaLabel = 'Tabs', }) => {
    // Controlled vs uncontrolled state
    const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState(defaultActiveTab);
    const isControlled = controlledActiveTab !== undefined;
    const activeTabIndex = isControlled ? controlledActiveTab : uncontrolledActiveTab;
    // Extract tab information from children
    const tabs = Children.toArray(children).filter((child) => isValidElement(child));
    // Handle tab change
    const handleTabChange = useCallback((index) => {
        const tab = tabs[index];
        if (!tab || tab.props.disabled)
            return;
        if (!isControlled) {
            setUncontrolledActiveTab(index);
        }
        onChange?.(index, tab.props.value);
    }, [tabs, isControlled, onChange]);
    // Keyboard navigation
    const handleKeyDown = useCallback((event, currentIndex) => {
        let newIndex = currentIndex;
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
    const containerClassNames = [styles$7.container, className].filter(Boolean).join(' ');
    const tabListClassNames = [
        styles$7.tabList,
        styles$7[`tabList--${size}`],
        fullWidth && styles$7['tabList--full-width'],
        tabListClassName,
    ]
        .filter(Boolean)
        .join(' ');
    const panelContainerClassNames = [
        styles$7.panelContainer,
        styles$7[`panelContainer--${size}`],
        panelClassName,
    ]
        .filter(Boolean)
        .join(' ');
    return (jsxs("div", { className: containerClassNames, children: [jsx("div", { role: "tablist", "aria-label": ariaLabel, className: tabListClassNames, children: tabs.map((tab, index) => {
                    const isActive = index === activeTabIndex;
                    const isDisabled = tab.props.disabled;
                    const tabClassNames = [
                        styles$7.tab,
                        styles$7[`tab--${size}`],
                        isActive && styles$7['tab--active'],
                        isDisabled && styles$7['tab--disabled'],
                        fullWidth && styles$7['tab--full-width'],
                    ]
                        .filter(Boolean)
                        .join(' ');
                    return (jsxs("button", { role: "tab", type: "button", "aria-selected": isActive, "aria-controls": `panel-${index}`, id: `tab-${index}`, tabIndex: isActive ? 0 : -1, disabled: isDisabled, className: tabClassNames, onClick: () => handleTabChange(index), onKeyDown: (e) => handleKeyDown(e, index), children: [tab.props.icon && jsx("span", { className: styles$7.tabIcon, children: tab.props.icon }), tab.props.label] }, index));
                }) }), tabs.map((tab, index) => {
                const isActive = index === activeTabIndex;
                return (jsx("div", { role: "tabpanel", id: `panel-${index}`, "aria-labelledby": `tab-${index}`, hidden: !isActive, className: panelContainerClassNames, children: isActive && tab.props.children }, index));
            })] }));
};
Tabs.displayName = 'Tabs';

// Utility for merging CSS class names
// Filters out falsy values and joins valid class names with spaces
/**
 * Merges multiple class names into a single string
 * Filters out undefined, null, false, and empty strings
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
    return classes.filter(Boolean).join(' ');
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

var styles$6 = {"window":"Window-module_window","window--active":"Window-module_window--active","window--inactive":"Window-module_window--inactive","window--draggable":"Window-module_window--draggable","titleBar":"Window-module_titleBar","titleCenter":"Window-module_titleCenter","titleBar--draggable":"Window-module_titleBar--draggable","titleBar--dragging":"Window-module_titleBar--dragging","controls":"Window-module_controls","controlButton":"Window-module_controlButton","closeBox":"Window-module_closeBox","minimizeBox":"Window-module_minimizeBox","maximizeBox":"Window-module_maximizeBox","titleText":"Window-module_titleText","content":"Window-module_content","resizeHandle":"Window-module_resizeHandle"};

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
    return (jsxs("svg", { width: "132", height: "13", viewBox: "0 0 132 13", fill: "none", preserveAspectRatio: "none", "aria-hidden": "true", focusable: "false", xmlns: "http://www.w3.org/2000/svg", children: [jsx("rect", { width: "130.517", height: "13", style: PATTERN_FILL }), jsx("rect", { width: "1", height: "13", style: PATTERN_HIGHLIGHT }), jsx("rect", { x: "130", width: "1", height: "13", style: PATTERN_SHADE }), jsx("rect", { y: "1", width: "131.268", height: "1", style: PATTERN_STRIPE }), jsx("rect", { y: "5", width: "131.268", height: "1", style: PATTERN_STRIPE }), jsx("rect", { y: "9", width: "131.268", height: "1", style: PATTERN_STRIPE }), jsx("rect", { y: "3", width: "131.268", height: "1", style: PATTERN_STRIPE }), jsx("rect", { y: "7", width: "131.268", height: "1", style: PATTERN_STRIPE }), jsx("rect", { y: "11", width: "131.268", height: "1", style: PATTERN_STRIPE })] }));
});
/** Reads the metrics of an element's `offsetParent`, falling back to the viewport. */
function readParentMetrics(element) {
    const parent = element.offsetParent;
    if (parent) {
        const rect = parent.getBoundingClientRect();
        return { left: rect.left, top: rect.top, width: parent.clientWidth, height: parent.clientHeight };
    }
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : Number.POSITIVE_INFINITY;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : Number.POSITIVE_INFINITY;
    return { left: 0, top: 0, width: viewportWidth, height: viewportHeight };
}
/**
 * Mac OS 9 style Window component
 *
 * Classic window container with title bar and content area.
 *
 * Features:
 * - Classic Mac OS 9 window styling with beveled edges
 * - Optional title bar with window controls
 * - Active/inactive states
 * - Composable with custom TitleBar component
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
 * // Window with custom title bar
 * <Window titleBar={<TitleBar title="Custom" />}>
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
const Window = forwardRef(({ children, title, titleBar, active = true, width = 'auto', height = 'auto', className = '', contentClassName = '', classes, showControls = true, onClose, onMinimize, onMaximize, onMouseEnter, onActivate, zIndex, resizable = false, minWidth = 200, minHeight = 100, maxWidth, maxHeight, onResize, draggable = false, defaultPosition, position: controlledPosition, onPositionChange, boundary = 'parent', keyboardStep = 1, }, ref) => {
    // Root element, used by the keyboard handlers to measure the window
    // without a DOM query.
    const windowRef = useRef(null);
    // Element captured at gesture start, so mousemove never queries the DOM.
    const dragWindowRef = useRef(null);
    // Parent metrics captured once per gesture — the positioning ancestor
    // cannot resize mid-drag, so re-measuring on every move was pure cost.
    const parentMetricsRef = useRef(null);
    // Drag state management
    const [internalPosition, setInternalPosition] = useState(defaultPosition || null);
    const [isDragging, setIsDragging] = useState(false);
    const [hasBeenDragged, setHasBeenDragged] = useState(!!defaultPosition);
    const dragStartRef = useRef(null);
    // Resize state management. `hasBeenResized` flips to true on the first
    // successful resize and stays true thereafter; from that point on
    // `internalSize` is the canonical width/height so the user's resize
    // persists after pointerup (issue #10).
    const [internalSize, setInternalSize] = useState({
        width,
        height,
    });
    const [isResizing, setIsResizing] = useState(false);
    const [hasBeenResized, setHasBeenResized] = useState(false);
    const resizeStartRef = useRef(null);
    // requestAnimationFrame coalescing. Pointer devices fire moves far
    // faster than the browser paints; without this every event triggered a
    // React render (issue #21).
    const rafRef = useRef(null);
    const pendingPointerRef = useRef(null);
    const cancelPendingFrame = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        pendingPointerRef.current = null;
    }, []);
    // Cancel any in-flight frame if the component unmounts mid-gesture.
    useEffect(() => cancelPendingFrame, [cancelPendingFrame]);
    // Latest-callback refs. Reading from a ref inside the document pointermove
    // handler means we can leave callbacks out of the effect dependency
    // arrays — otherwise the listeners would re-attach mid-drag every time
    // the parent re-rendered (issue #9), causing dropped move events.
    const latestRef = useRef({
        controlledPosition,
        onPositionChange,
        onResize,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
        boundary,
    });
    useEffect(() => {
        latestRef.current = {
            controlledPosition,
            onPositionChange,
            onResize,
            minWidth,
            minHeight,
            maxWidth,
            maxHeight,
            boundary,
        };
    });
    // Use controlled position if provided, otherwise use internal state
    const currentPosition = controlledPosition || internalPosition;
    // A window is absolutely positioned as soon as it has a position from
    // any source. Deriving this (rather than latching it in state at mount)
    // means a `position` prop supplied later still takes effect (issue #26).
    const isPositioned = draggable && (hasBeenDragged || currentPosition !== null);
    // Once the user has resized, internalSize wins so the dimensions
    // persist after pointerup. Before that we honor the width/height props.
    const currentWidth = hasBeenResized ? internalSize.width : width;
    const currentHeight = hasBeenResized ? internalSize.height : height;
    /**
     * Clamps a candidate position so at least DRAG_BOUNDARY_BUFFER pixels of
     * the window stay inside the positioning ancestor.
     */
    const clampPosition = useCallback((x, y, element, metrics) => {
        if (latestRef.current.boundary !== 'parent')
            return { x, y };
        const minX = DRAG_BOUNDARY_BUFFER - element.offsetWidth;
        const maxX = metrics.width - DRAG_BOUNDARY_BUFFER;
        const minY = 0;
        const maxY = metrics.height - DRAG_BOUNDARY_BUFFER;
        return {
            x: Math.max(minX, Math.min(maxX, x)),
            y: Math.max(minY, Math.min(maxY, y)),
        };
    }, []);
    /** Publishes a new position to whichever source of truth is in charge. */
    const commitPosition = useCallback((next) => {
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
    /** Clamps and publishes a new size. */
    const commitSize = useCallback((rawWidth, rawHeight) => {
        const { minWidth: liveMinWidth, minHeight: liveMinHeight, maxWidth: liveMaxWidth, maxHeight: liveMaxHeight, onResize: liveOnResize, } = latestRef.current;
        let nextWidth = rawWidth;
        let nextHeight = rawHeight;
        if (nextWidth < liveMinWidth)
            nextWidth = liveMinWidth;
        if (nextHeight < liveMinHeight)
            nextHeight = liveMinHeight;
        if (liveMaxWidth && nextWidth > liveMaxWidth)
            nextWidth = liveMaxWidth;
        if (liveMaxHeight && nextHeight > liveMaxHeight)
            nextHeight = liveMaxHeight;
        setInternalSize({ width: nextWidth, height: nextHeight });
        setHasBeenResized(true);
        liveOnResize?.({ width: nextWidth, height: nextHeight });
    }, []);
    // Pointer-down on the title bar starts a drag. Pointer Events (instead
    // of mouse events) unify mouse, touch, and pen input so the component
    // works on tablets and phones — previously it was mouse-only.
    const handleTitleBarPointerDown = useCallback((event) => {
        if (!draggable)
            return;
        // Only react to primary button / primary contact. Ignores
        // right-click and secondary touches that browsers report
        // alongside the primary one.
        if (event.button !== 0 || !event.isPrimary)
            return;
        // Don't start drag if clicking on buttons
        if (event.target.closest('button')) {
            return;
        }
        event.preventDefault();
        const windowElement = event.currentTarget.closest(`.${styles$6.window}`);
        if (!windowElement)
            return;
        // Store the window element reference for use during drag
        dragWindowRef.current = windowElement;
        parentMetricsRef.current = readParentMetrics(windowElement);
        const rect = windowElement.getBoundingClientRect();
        const metrics = parentMetricsRef.current;
        // Offset from pointer to window origin, in the parent's space.
        dragStartRef.current = {
            x: event.clientX - (rect.left - metrics.left),
            y: event.clientY - (rect.top - metrics.top),
        };
        setIsDragging(true);
    }, [draggable]);
    // Pointer-down on the resize handle starts a resize gesture.
    const handleResizePointerDown = useCallback((event) => {
        if (!resizable)
            return;
        if (event.button !== 0 || !event.isPrimary)
            return;
        event.preventDefault();
        event.stopPropagation();
        const windowElement = event.currentTarget.closest(`.${styles$6.window}`);
        if (!windowElement)
            return;
        const rect = windowElement.getBoundingClientRect();
        resizeStartRef.current = {
            width: rect.width,
            height: rect.height,
            pointerX: event.clientX,
            pointerY: event.clientY,
        };
        setIsResizing(true);
    }, [resizable]);
    // Resize listeners. Depends only on `isResizing` so they attach once
    // when the user grabs the handle and detach on pointerup, regardless
    // of how often the parent re-renders during the gesture (issue #9).
    // Pointer events instead of mouse events give us mouse/touch/pen
    // uniformity (issue #11); pointercancel covers system interruptions.
    useEffect(() => {
        if (!isResizing)
            return;
        const flush = () => {
            rafRef.current = null;
            const pointer = pendingPointerRef.current;
            const start = resizeStartRef.current;
            if (!pointer || !start)
                return;
            commitSize(start.width + (pointer.x - start.pointerX), start.height + (pointer.y - start.pointerY));
        };
        const handlePointerMove = (event) => {
            if (!event.isPrimary)
                return;
            event.preventDefault();
            if (!resizeStartRef.current)
                return;
            pendingPointerRef.current = { x: event.clientX, y: event.clientY };
            if (rafRef.current === null) {
                rafRef.current = requestAnimationFrame(flush);
            }
        };
        const handlePointerEnd = () => {
            // Apply the final pointer position before tearing down, so a
            // gesture that ends between frames isn't silently dropped.
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
                flush();
            }
            pendingPointerRef.current = null;
            setIsResizing(false);
            resizeStartRef.current = null;
        };
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerEnd);
        document.addEventListener('pointercancel', handlePointerEnd);
        return () => {
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerEnd);
            document.removeEventListener('pointercancel', handlePointerEnd);
            cancelPendingFrame();
        };
    }, [isResizing, commitSize, cancelPendingFrame]);
    // Drag listeners. Same effect-deps strategy as resize — attach once
    // on drag start, detach on drag end (issue #9). The boundary clamp
    // (issue #12) prevents the window from being lost off-screen.
    // Pointer events for touch / pen support (issue #11).
    useEffect(() => {
        if (!isDragging)
            return;
        const flush = () => {
            rafRef.current = null;
            const pointer = pendingPointerRef.current;
            const start = dragStartRef.current;
            const windowElement = dragWindowRef.current;
            const metrics = parentMetricsRef.current;
            if (!pointer || !start || !windowElement || !metrics)
                return;
            commitPosition(clampPosition(pointer.x - metrics.left - start.x, pointer.y - metrics.top - start.y, windowElement, metrics));
        };
        const handlePointerMove = (event) => {
            if (!event.isPrimary)
                return;
            event.preventDefault();
            if (!dragStartRef.current)
                return;
            pendingPointerRef.current = { x: event.clientX, y: event.clientY };
            if (rafRef.current === null) {
                rafRef.current = requestAnimationFrame(flush);
            }
        };
        const handlePointerEnd = () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
                flush();
            }
            pendingPointerRef.current = null;
            setIsDragging(false);
            dragStartRef.current = null;
            dragWindowRef.current = null;
            parentMetricsRef.current = null;
        };
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerEnd);
        document.addEventListener('pointercancel', handlePointerEnd);
        return () => {
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerEnd);
            document.removeEventListener('pointercancel', handlePointerEnd);
            cancelPendingFrame();
        };
    }, [isDragging, commitPosition, clampPosition, cancelPendingFrame]);
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
    const handleTitleBarKeyDown = useCallback((event) => {
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
        const metrics = readParentMetrics(windowElement);
        // Before the first move the window is still in normal flow, so
        // derive its current origin from the live layout rect.
        const origin = currentPosition ??
            (() => {
                const rect = windowElement.getBoundingClientRect();
                return { x: rect.left - metrics.left, y: rect.top - metrics.top };
            })();
        commitPosition(clampPosition(origin.x + delta.dx * step, origin.y + delta.dy * step, windowElement, metrics));
    }, [draggable, keyboardStep, currentPosition, commitPosition, clampPosition]);
    const handleResizeKeyDown = useCallback((event) => {
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
        commitSize(rect.width + delta.dx * step, rect.height + delta.dy * step);
    }, [resizable, keyboardStep, commitSize]);
    // --- Rendering --------------------------------------------------------
    const windowClassNames = mergeClasses(styles$6.window, active ? styles$6['window--active'] : styles$6['window--inactive'], isPositioned && styles$6['window--draggable'], className, classes?.root);
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
    if (zIndex !== undefined) {
        windowStyle.zIndex = zIndex;
    }
    // Merge the forwarded ref with our internal one so keyboard handlers
    // can measure the window without a DOM query.
    const setRootRef = useCallback((node) => {
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
            return (jsxs("div", { className: titleBarClassNames, "data-numControls": [onClose, onMinimize, onMaximize].filter(Boolean).length, onPointerDown: handleTitleBarPointerDown, onKeyDown: draggable ? handleTitleBarKeyDown : undefined, tabIndex: draggable ? 0 : undefined, "aria-label": draggable ? `Move ${title} window` : undefined, "aria-keyshortcuts": draggable ? 'ArrowUp ArrowDown ArrowLeft ArrowRight' : undefined, style: draggable ? { touchAction: 'none' } : undefined, children: [showControls && (jsxs("div", { className: mergeClasses(styles$6.controls, classes?.controls), children: [onClose && (jsx("button", { type: "button", className: mergeClasses(styles$6.controlButton, classes?.controlButton), onClick: onClose, "aria-label": "Close", title: "Close", children: jsx("div", { className: styles$6.closeBox }) })), onMinimize && (jsx("button", { type: "button", className: mergeClasses(styles$6.controlButton, classes?.controlButton), onClick: onMinimize, "aria-label": "Minimize", title: "Minimize", children: jsx("div", { className: styles$6.minimizeBox }) })), onMaximize && (jsx("button", { type: "button", className: mergeClasses(styles$6.controlButton, classes?.controlButton), onClick: onMaximize, "aria-label": "Maximize", title: "Maximize", children: jsx("div", { className: styles$6.maximizeBox }) }))] })), jsxs("div", { className: styles$6.titleCenter, children: [jsx(TitleBarPattern, {}), jsx("div", { className: mergeClasses(styles$6.titleText, classes?.titleText, 'bold'), children: title }), jsx(TitleBarPattern, {})] })] }));
        }
        return null;
    };
    return (jsxs("div", { ref: setRootRef, className: windowClassNames, style: windowStyle, onMouseEnter: onMouseEnter, onPointerDown: onActivate, onFocusCapture: onActivate, children: [renderTitleBar(), jsx("div", { className: contentClassNames, children: children }), resizable && (jsx("button", { type: "button", className: mergeClasses(styles$6.resizeHandle, classes?.resizeHandle), onPointerDown: handleResizePointerDown, onKeyDown: handleResizeKeyDown, "aria-label": "Resize window", "aria-keyshortcuts": "ArrowUp ArrowDown ArrowLeft ArrowRight", title: "Resize window", style: { touchAction: 'none' } }))] }));
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
function lockBodyScroll() {
    if (typeof document === 'undefined')
        return;
    scrollLockCount += 1;
    if (scrollLockCount === 1) {
        savedBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
    }
}
function unlockBodyScroll() {
    if (typeof document === 'undefined')
        return;
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
        document.body.style.overflow = savedBodyOverflow ?? '';
        savedBodyOverflow = null;
    }
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
const Dialog = forwardRef(({ open = false, onClose, closeOnBackdropClick = true, closeOnEscape = true, backdropClassName = '', trapFocus = true, initialFocus, role = 'dialog', ariaLabel, ariaLabelledBy, ariaDescribedBy, children, ...windowProps }, ref) => {
    const dialogRef = useRef(null);
    const previousActiveElement = useRef(null);
    // Derive an accessible name. Prefer explicit ariaLabelledBy → ariaLabel
    // → the Window title if it happens to be a plain string.
    const titleProp = windowProps.title;
    const resolvedAriaLabel = ariaLabel ?? (typeof titleProp === 'string' ? titleProp : undefined);
    // Push/pop the dialog onto the stack and lock body scroll while open.
    // Combining these into one effect ensures they unwind in the right
    // order on close and avoids races with the other effects below.
    useEffect(() => {
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
    }, [open]);
    // Initial focus. Runs before paint via useLayoutEffect so the user
    // never sees a flash of focus outside the dialog.
    useLayoutEffect(() => {
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
            if (focusables.length > 0) {
                target = focusables[0];
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
    }, [open, initialFocus]);
    // Escape: only the topmost dialog reacts so stacked dialogs close
    // one at a time. The bubble phase + stopPropagation also prevents
    // the host app's own Escape handlers from firing under the modal.
    useEffect(() => {
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
    useEffect(() => {
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
    const handleBackdropClick = useCallback((event) => {
        if (closeOnBackdropClick && event.target === event.currentTarget) {
            onClose?.();
        }
    }, [closeOnBackdropClick, onClose]);
    if (!open)
        return null;
    const backdropClassNames = [styles$5.backdrop, backdropClassName].filter(Boolean).join(' ');
    return (jsx("div", { className: backdropClassNames, onClick: handleBackdropClick, children: jsx("div", { className: styles$5.dialogContainer, ref: dialogRef, role: role, "aria-modal": "true", "aria-label": ariaLabelledBy ? undefined : resolvedAriaLabel, "aria-labelledby": ariaLabelledBy, "aria-describedby": ariaDescribedBy, children: jsx(Window, { ...windowProps, ref: ref, active: true, onClose: onClose, children: children }) }) }));
});
Dialog.displayName = 'Dialog';

var styles$4 = {"menuBar":"MenuBar-module_menuBar","leftContent":"MenuBar-module_leftContent","menusContainer":"MenuBar-module_menusContainer","menuContainer":"MenuBar-module_menuContainer","rightContent":"MenuBar-module_rightContent","menuButton":"MenuBar-module_menuButton","menuButton--disabled":"MenuBar-module_menuButton--disabled","menuButton--open":"MenuBar-module_menuButton--open","dropdown":"MenuBar-module_dropdown","dropdown--right":"MenuBar-module_dropdown--right"};

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
 * - Keyboard navigation (Left/Right for menus, Up/Down for items)
 * - Click outside to close
 * - Escape key to close
 * - Controlled state (consumers manage open/closed)
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
 *       items: (
 *         <>
 *           <MenuItem label="Open..." shortcut="⌘O" onClick={() => {}} />
 *           <MenuItem label="Save" shortcut="⌘S" onClick={() => {}} />
 *         </>
 *       ),
 *     },
 *     {
 *       label: 'Home',
 *       type: 'link',
 *       href: '/',
 *     },
 *   ]}
 *   rightContent={[
 *     <Clock key="clock" />,
 *     <div key="divider" className={styles.divider} />,
 *     <SystemIndicator key="indicator" />,
 *   ]}
 * />
 * ```
 */
const MenuBar = forwardRef(({ menus, openMenuIndex, onMenuOpen, onMenuClose, className = '', dropdownClassName = '', leftContent, rightContent, }, ref) => {
    const [menuBarElement, setMenuBarElement] = useState(null);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [internalOpenIndex, setInternalOpenIndex] = useState(undefined);
    const isControlled = openMenuIndex !== undefined;
    const activeOpenIndex = isControlled ? openMenuIndex : internalOpenIndex;
    const handleMenuOpenInternal = (index) => {
        if (!isControlled) {
            setInternalOpenIndex(index);
        }
        onMenuOpen?.(index);
    };
    const handleMenuCloseInternal = () => {
        if (!isControlled) {
            setInternalOpenIndex(undefined);
        }
        onMenuClose?.();
    };
    // Handle click outside to close menu
    useEffect(() => {
        if (activeOpenIndex === undefined || !menuBarElement)
            return;
        const handleClickOutside = (event) => {
            if (menuBarElement && !menuBarElement.contains(event.target)) {
                handleMenuCloseInternal();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeOpenIndex, onMenuClose, menuBarElement, isControlled]);
    // Handle Escape key to close menu
    useEffect(() => {
        if (activeOpenIndex === undefined)
            return;
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                handleMenuCloseInternal();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [activeOpenIndex, onMenuClose, isControlled]);
    // Handle keyboard navigation
    const handleKeyDown = useCallback((event) => {
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                if (activeOpenIndex !== undefined) {
                    // Move to previous menu
                    const prevIndex = activeOpenIndex > 0 ? activeOpenIndex - 1 : menus.length - 1;
                    if (!menus[prevIndex]?.disabled) {
                        handleMenuOpenInternal(prevIndex);
                    }
                }
                else if (focusedIndex > 0) {
                    setFocusedIndex(focusedIndex - 1);
                }
                break;
            case 'ArrowRight':
                event.preventDefault();
                if (activeOpenIndex !== undefined) {
                    // Move to next menu
                    const nextIndex = activeOpenIndex < menus.length - 1 ? activeOpenIndex + 1 : 0;
                    if (!menus[nextIndex]?.disabled) {
                        handleMenuOpenInternal(nextIndex);
                    }
                }
                else if (focusedIndex < menus.length - 1) {
                    setFocusedIndex(focusedIndex + 1);
                }
                break;
            case 'ArrowDown':
                event.preventDefault();
                if (activeOpenIndex === undefined && focusedIndex >= 0) {
                    // Open the focused menu (only if it's a dropdown)
                    const menu = menus[focusedIndex];
                    if (!menu?.disabled && menu?.type !== 'link') {
                        handleMenuOpenInternal(focusedIndex);
                    }
                }
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (activeOpenIndex === undefined && focusedIndex >= 0) {
                    const menu = menus[focusedIndex];
                    if (!menu?.disabled) {
                        if (menu.type === 'link') {
                            // Trigger click handler for link-type menu
                            menu.onClick?.();
                        }
                        else {
                            // Open the focused dropdown menu
                            handleMenuOpenInternal(focusedIndex);
                        }
                    }
                }
                break;
        }
    }, [activeOpenIndex, focusedIndex, menus, onMenuOpen, onMenuClose, isControlled]);
    // Handle menu button click
    const handleMenuClick = (index) => {
        const menu = menus[index];
        if (menu?.disabled)
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
    const menuBarClassNames = [styles$4.menuBar, className].filter(Boolean).join(' ');
    const dropdownClassNames = [styles$4.dropdown, dropdownClassName].filter(Boolean).join(' ');
    // Callback ref to handle both internal state and forwarded ref
    const handleRef = useCallback((node) => {
        setMenuBarElement(node);
        if (typeof ref === 'function') {
            ref(node);
        }
        else if (ref) {
            ref.current = node;
        }
    }, [ref]);
    return (jsxs("div", { ref: handleRef, className: menuBarClassNames, role: "menubar", onKeyDown: handleKeyDown, children: [leftContent && (jsx("div", { className: styles$4.leftContent, children: leftContent })), jsx("div", { className: styles$4.menusContainer, children: menus.map((menu, index) => {
                    const isOpen = activeOpenIndex === index;
                    const isDropdown = menu.type !== 'link';
                    const menuButtonClassNames = [
                        styles$4.menuButton,
                        isOpen ? styles$4['menuButton--open'] : '',
                        menu.disabled ? styles$4['menuButton--disabled'] : '',
                    ]
                        .filter(Boolean)
                        .join(' ');
                    // For link-type menus, render as anchor if href is provided.
                    // sanitizeUrl strips javascript:/data:/vbscript: schemes before the
                    // href reaches the DOM, preventing stored-XSS when consumers wire
                    // menus from CMS or user-supplied data.
                    if (menu.type === 'link' && menu.href) {
                        const safeHref = sanitizeUrl(menu.href);
                        return (jsx("div", { className: styles$4.menuContainer, children: jsx("a", { href: safeHref, className: menuButtonClassNames, onClick: (e) => {
                                    if (menu.onClick) {
                                        e.preventDefault();
                                        menu.onClick();
                                    }
                                }, onFocus: () => setFocusedIndex(index), onBlur: () => setFocusedIndex(-1), "aria-disabled": menu.disabled, children: jsx("h3", { children: menu.label }) }) }, index));
                    }
                    // Standard dropdown menu or link without href
                    return (jsxs("div", { className: styles$4.menuContainer, children: [jsx("button", { type: "button", className: menuButtonClassNames, onClick: () => handleMenuClick(index), onFocus: () => setFocusedIndex(index), onBlur: () => setFocusedIndex(-1), disabled: menu.disabled, "aria-haspopup": isDropdown ? 'true' : undefined, "aria-expanded": isOpen, "aria-disabled": menu.disabled, children: jsx("h3", { children: menu.label }) }), isOpen && isDropdown && menu.items && (jsx("div", { className: dropdownClassNames, role: "menu", children: menu.items }))] }, index));
                }) }), rightContent && (jsx("div", { className: styles$4.rightContent, children: Array.isArray(rightContent)
                    ? rightContent.map((item, index) => (jsx(React.Fragment, { children: item }, index)))
                    : rightContent }))] }));
});
MenuBar.displayName = 'MenuBar';

var styles$3 = {"menuItem":"MenuItem-module_menuItem","menuItem--disabled":"MenuItem-module_menuItem--disabled","menuItem--selected":"MenuItem-module_menuItem--selected","menuItem--separator":"MenuItem-module_menuItem--separator","checkmark":"MenuItem-module_checkmark","icon":"MenuItem-module_icon","label":"MenuItem-module_label","shortcut":"MenuItem-module_shortcut","submenuArrow":"MenuItem-module_submenuArrow","submenu":"MenuItem-module_submenu","separatorLine":"MenuItem-module_separatorLine"};

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
const MenuItem = forwardRef(({ label, shortcut, disabled = false, selected = false, separator = false, checked = false, icon, onClick, onFocus, onBlur, className = '', hasSubmenu = false, items, }, ref) => {
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
    const effectiveHasSubmenu = hasSubmenu || !!items;
    // Internal refs to the trigger button and submenu container, used by the
    // keyboard handler to move focus into / out of the submenu. The trigger
    // ref is fanned out so the consumer's forwardRef still receives the node.
    const buttonRef = useRef(null);
    const submenuRef = useRef(null);
    const setButtonRef = useCallback((node) => {
        buttonRef.current = node;
        if (typeof ref === 'function')
            ref(node);
        else if (ref)
            ref.current = node;
    }, [ref]);
    // Class names
    const menuItemClassNames = [
        styles$3.menuItem,
        selected ? styles$3['menuItem--selected'] : '',
        disabled ? styles$3['menuItem--disabled'] : '',
        separator ? styles$3['menuItem--separator'] : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');
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
    return (jsxs("div", { className: styles$3.menuItemContainer, onMouseEnter: () => setIsSubmenuOpen(true), onMouseLeave: () => setIsSubmenuOpen(false), style: { position: 'relative', width: '100%' }, children: [jsxs("button", { ref: setButtonRef, type: "button", className: menuItemClassNames, onClick: handleClick, onKeyDown: handleKeyDown, onFocus: onFocus, onBlur: onBlur, disabled: disabled, role: "menuitem", "aria-disabled": disabled, "aria-checked": checked ? 'true' : undefined, "aria-haspopup": effectiveHasSubmenu ? 'menu' : undefined, "aria-expanded": effectiveHasSubmenu ? isSubmenuOpen : undefined, children: [jsx("span", { className: styles$3.checkmark, children: checked && '✓' }), icon && jsx("span", { className: styles$3.icon, children: icon }), jsx("span", { className: styles$3.label, children: label }), shortcut && jsx("span", { className: styles$3.shortcut, children: shortcut }), effectiveHasSubmenu && jsx("span", { className: styles$3.submenuArrow, children: "\u25B6" })] }), items && isSubmenuOpen && (jsx("div", { ref: submenuRef, className: styles$3.submenu, role: "menu", children: items })), separator && jsx("div", { className: styles$3.separatorLine, role: "separator" })] }));
});
MenuItem.displayName = 'MenuItem';

/**
 * Mac OS 9 style MenuDropdown component
 *
 * A standalone dropdown menu that shares the styling of the MenuBar.
 * Useful for placing menus in the status area (rightContent) or other parts of the app.
 */
const MenuDropdown = ({ label, items, disabled = false, className = '', dropdownClassName = '', align = 'left', }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    // Handle click outside to close menu
    useEffect(() => {
        if (!isOpen)
            return;
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);
    // Handle Escape key to close menu
    useEffect(() => {
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
    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };
    const menuContainerClassNames = [
        styles$4.menuContainer,
        className
    ].filter(Boolean).join(' ');
    const menuButtonClassNames = [
        styles$4.menuButton,
        isOpen ? styles$4['menuButton--open'] : '',
        disabled ? styles$4['menuButton--disabled'] : '',
    ].filter(Boolean).join(' ');
    const dropdownClassNames = [
        styles$4.dropdown,
        align === 'right' ? styles$4['dropdown--right'] : '',
        dropdownClassName
    ].filter(Boolean).join(' ');
    return (jsxs("div", { ref: containerRef, className: menuContainerClassNames, children: [jsx("button", { type: "button", className: menuButtonClassNames, onClick: handleToggle, disabled: disabled, "aria-haspopup": "true", "aria-expanded": isOpen, "aria-disabled": disabled, children: typeof label === 'string' ? jsx("h3", { children: label }) : label }), isOpen && (jsx("div", { className: dropdownClassNames, role: "menu", onClick: () => setIsOpen(false), children: items }))] }));
};

var styles$2 = {"scrollbar":"Scrollbar-module_scrollbar","scrollbar--vertical":"Scrollbar-module_scrollbar--vertical","scrollbar--horizontal":"Scrollbar-module_scrollbar--horizontal","scrollbar--disabled":"Scrollbar-module_scrollbar--disabled","arrow":"Scrollbar-module_arrow","arrowIcon":"Scrollbar-module_arrowIcon","arrow--start":"Scrollbar-module_arrow--start","arrow--end":"Scrollbar-module_arrow--end","track":"Scrollbar-module_track","thumb":"Scrollbar-module_thumb"};

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
 *   onChange={(value) => console.log('Scroll position:', value)}
 * />
 * ```
 */
const Scrollbar = forwardRef(({ orientation = 'vertical', value = 0, viewportRatio = 0.2, onChange, className = '', disabled = false, ariaLabel, controls, step = 0.1, }, ref) => {
    const trackRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPos, setDragStartPos] = useState(0);
    const [dragStartValue, setDragStartValue] = useState(0);
    const isVertical = orientation === 'vertical';
    // Helper used by both arrow buttons and keyboard handler to clamp
    // the next value into the valid 0-1 range before notifying.
    const commitValue = useCallback((next) => {
        if (disabled || !onChange)
            return;
        const clamped = Math.max(0, Math.min(1, next));
        if (clamped !== value)
            onChange(clamped);
    }, [disabled, onChange, value]);
    // Calculate thumb size based on viewport ratio
    const thumbSize = Math.max(viewportRatio * 100, 10); // Minimum 10% size
    // Calculate thumb position
    const maxThumbPos = 100 - thumbSize;
    const thumbPos = value * maxThumbPos;
    // Class names
    const classNames = [
        styles$2.scrollbar,
        styles$2[`scrollbar--${orientation}`],
        disabled && styles$2['scrollbar--disabled'],
        className,
    ]
        .filter(Boolean)
        .join(' ');
    // Handle arrow clicks
    const handleDecrement = useCallback(() => commitValue(value - step), [commitValue, step, value]);
    const handleIncrement = useCallback(() => commitValue(value + step), [commitValue, step, value]);
    // WAI-ARIA scrollbar keyboard interaction.
    // Arrow keys step by `step`, PageUp/PageDown step by `viewportRatio`,
    // Home/End jump to the extremes. The handler is attached to the
    // focusable track so it only fires when the scrollbar itself has focus.
    const handleKeyDown = useCallback((event) => {
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
                commitValue(value - viewportRatio);
                break;
            case 'PageDown':
                event.preventDefault();
                commitValue(value + viewportRatio);
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
    }, [commitValue, disabled, isVertical, step, value, viewportRatio]);
    // Handle track clicks
    const handleTrackClick = useCallback((event) => {
        if (disabled || !onChange || !trackRef.current)
            return;
        const rect = trackRef.current.getBoundingClientRect();
        const clickPos = isVertical
            ? event.clientY - rect.top
            : event.clientX - rect.left;
        const trackSize = isVertical ? rect.height : rect.width;
        // Convert click position to scroll value (0-1)
        const clickRatio = clickPos / trackSize;
        const newValue = Math.max(0, Math.min(1, clickRatio));
        onChange(newValue);
    }, [disabled, onChange, isVertical]);
    // Pointer-down on the thumb starts a drag. Pointer Events instead
    // of mouse events give us mouse/touch/pen support — previously the
    // thumb was un-draggable on tablets and phones (issue #11).
    const handleThumbPointerDown = useCallback((event) => {
        if (disabled)
            return;
        if (event.button !== 0 || !event.isPrimary)
            return;
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
        setDragStartPos(isVertical ? event.clientY : event.clientX);
        setDragStartValue(value);
    }, [disabled, isVertical, value]);
    // Handle drag move. Pointer events for touch/pen uniformity;
    // pointercancel covers system interruptions on mobile.
    useEffect(() => {
        if (!isDragging || !onChange || !trackRef.current)
            return;
        const handlePointerMove = (event) => {
            if (!event.isPrimary)
                return;
            const currentPos = isVertical ? event.clientY : event.clientX;
            const delta = currentPos - dragStartPos;
            const rect = trackRef.current.getBoundingClientRect();
            const trackSize = isVertical ? rect.height : rect.width;
            const deltaRatio = delta / trackSize;
            const newValue = Math.max(0, Math.min(1, dragStartValue + deltaRatio));
            onChange(newValue);
        };
        const handlePointerEnd = () => {
            setIsDragging(false);
        };
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerEnd);
        document.addEventListener('pointercancel', handlePointerEnd);
        return () => {
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerEnd);
            document.removeEventListener('pointercancel', handlePointerEnd);
        };
    }, [isDragging, dragStartPos, dragStartValue, onChange, isVertical]);
    return (jsxs("div", { ref: ref, className: classNames, children: [jsx("button", { type: "button", className: `${styles$2.arrow} ${styles$2['arrow--start']}`, onClick: handleDecrement, disabled: disabled, "aria-label": isVertical ? 'Scroll up' : 'Scroll left', children: jsx("div", { className: styles$2.arrowIcon }) }), jsx("div", { ref: trackRef, className: styles$2.track, onClick: handleTrackClick, onKeyDown: handleKeyDown, role: "scrollbar", tabIndex: disabled ? -1 : 0, "aria-valuenow": Math.round(value * 100), "aria-valuemin": 0, "aria-valuemax": 100, "aria-orientation": orientation, "aria-label": ariaLabel, "aria-controls": controls, "aria-disabled": disabled || undefined, children: jsx("div", { className: styles$2.thumb, style: {
                        [isVertical ? 'height' : 'width']: `${thumbSize}%`,
                        [isVertical ? 'top' : 'left']: `${thumbPos}%`,
                        touchAction: 'none',
                    }, onPointerDown: handleThumbPointerDown }) }), jsx("button", { type: "button", className: `${styles$2.arrow} ${styles$2['arrow--end']}`, onClick: handleIncrement, disabled: disabled, "aria-label": isVertical ? 'Scroll down' : 'Scroll right', children: jsx("div", { className: styles$2.arrowIcon }) })] }));
});
Scrollbar.displayName = 'Scrollbar';

var styles$1 = {"listView":"ListView-module_listView","header":"ListView-module_header","headerCell":"ListView-module_headerCell","sortable":"ListView-module_sortable","sortIndicator":"ListView-module_sortIndicator","body":"ListView-module_body","row":"ListView-module_row","selected":"ListView-module_selected","cell":"ListView-module_cell","icon":"ListView-module_icon"};

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
 * ```
 */
const ListView = forwardRef(({ columns, items, selectedIds = [], onSelectionChange, onItemOpen, onItemMouseEnter, onItemMouseLeave, onSort, className = '', height = 'auto', classes, renderRow, renderCell, renderHeaderCell, onCellClick, onCellMouseEnter, onCellMouseLeave, }, ref) => {
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [hoveredRow, setHoveredRow] = useState(null);
    const [hoveredCell, setHoveredCell] = useState(null);
    // Class names
    const classNames = mergeClasses(styles$1.listView, className, classes?.root);
    // Handle column header click
    const handleColumnClick = useCallback((columnKey, sortable = true) => {
        if (!sortable || !onSort)
            return;
        const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(columnKey);
        setSortDirection(newDirection);
        onSort(columnKey, newDirection);
    }, [sortColumn, sortDirection, onSort]);
    // Handle row click
    const handleRowClick = useCallback((itemId, event) => {
        if (!onSelectionChange)
            return;
        if (event.metaKey || event.ctrlKey) {
            // Multi-select with Cmd/Ctrl
            if (selectedIds.includes(itemId)) {
                onSelectionChange(selectedIds.filter((id) => id !== itemId));
            }
            else {
                onSelectionChange([...selectedIds, itemId]);
            }
        }
        else if (event.shiftKey && selectedIds.length > 0) {
            // Range select with Shift
            const lastSelectedId = selectedIds[selectedIds.length - 1];
            const lastIndex = items.findIndex((item) => item.id === lastSelectedId);
            const currentIndex = items.findIndex((item) => item.id === itemId);
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);
            const rangeIds = items.slice(start, end + 1).map((item) => item.id);
            onSelectionChange(rangeIds);
        }
        else {
            // Single select
            onSelectionChange([itemId]);
        }
    }, [selectedIds, items, onSelectionChange]);
    // Handle row double-click
    const handleRowDoubleClick = useCallback((item) => {
        if (onItemOpen) {
            onItemOpen(item);
        }
    }, [onItemOpen]);
    // Handle row mouse enter
    useCallback((item) => {
        if (onItemMouseEnter) {
            onItemMouseEnter(item);
        }
    }, [onItemMouseEnter]);
    // Container style
    const containerStyle = {};
    if (height !== 'auto') {
        containerStyle.height = typeof height === 'number' ? `${height}px` : height;
    }
    return (jsxs("div", { ref: ref, className: classNames, style: containerStyle, children: [jsx("div", { className: mergeClasses(styles$1.header, classes?.header), children: columns.map((column) => {
                    const isSorted = sortColumn === column.key;
                    const headerState = {
                        isSorted,
                        sortDirection: isSorted ? sortDirection : undefined,
                    };
                    const headerDefaultProps = {
                        key: column.key,
                        className: mergeClasses(styles$1.headerCell, column.sortable !== false && styles$1.sortable, classes?.headerCell),
                        style: {
                            width: typeof column.width === 'number'
                                ? `${column.width}px`
                                : column.width,
                        },
                        onClick: () => handleColumnClick(column.key, column.sortable),
                        'data-column': column.key,
                        'data-sortable': column.sortable !== false,
                        ...(isSorted && {
                            'data-sorted': true,
                            'data-sort-direction': sortDirection,
                        }),
                    };
                    // Use custom render or default
                    if (renderHeaderCell) {
                        return renderHeaderCell(column, headerState, headerDefaultProps);
                    }
                    // Default header cell rendering
                    return (jsxs("div", { ...headerDefaultProps, children: [column.label, isSorted && (jsx("span", { className: styles$1.sortIndicator, children: sortDirection === 'asc' ? '▲' : '▼' }))] }));
                }) }), jsx("div", { className: mergeClasses(styles$1.body, classes?.body), children: items.map((item, rowIndex) => {
                    const isSelected = selectedIds.includes(item.id);
                    const isHovered = hoveredRow === item.id;
                    const rowState = {
                        isSelected,
                        isHovered,
                        index: rowIndex,
                    };
                    const rowDefaultProps = {
                        key: item.id,
                        className: mergeClasses(styles$1.row, isSelected && styles$1.selected, classes?.row),
                        onClick: (e) => handleRowClick(item.id, e),
                        onDoubleClick: () => handleRowDoubleClick(item),
                        onMouseEnter: () => {
                            setHoveredRow(item.id);
                            onItemMouseEnter?.(item);
                        },
                        onMouseLeave: () => {
                            setHoveredRow(null);
                            setHoveredCell(null);
                            onItemMouseLeave?.(item);
                        },
                        'data-selected': isSelected,
                        'data-index': rowIndex,
                        'data-item-id': item.id,
                    };
                    // Use custom row render or default
                    if (renderRow) {
                        return renderRow(item, rowState, rowDefaultProps);
                    }
                    // Default row rendering
                    return (jsx("div", { ...rowDefaultProps, children: columns.map((column, columnIndex) => {
                            const value = item[column.key];
                            const isCellHovered = hoveredCell?.rowId === item.id &&
                                hoveredCell?.columnKey === column.key;
                            const cellState = {
                                isHovered: isCellHovered,
                                isRowSelected: isSelected,
                                columnIndex,
                                rowIndex,
                            };
                            // Cell event handlers
                            const handleCellClick = (e) => {
                                if (onCellClick) {
                                    onCellClick(item, column, e);
                                }
                            };
                            const handleCellMouseEnter = () => {
                                setHoveredCell({ rowId: item.id, columnKey: column.key });
                                if (onCellMouseEnter) {
                                    onCellMouseEnter(item, column);
                                }
                            };
                            const handleCellMouseLeave = () => {
                                setHoveredCell(null);
                                if (onCellMouseLeave) {
                                    onCellMouseLeave(item, column);
                                }
                            };
                            // Use custom cell render or default
                            if (renderCell) {
                                return (jsx("div", { className: mergeClasses(styles$1.cell, classes?.cell), style: {
                                        width: typeof column.width === 'number'
                                            ? `${column.width}px`
                                            : column.width,
                                    }, "data-column": column.key, "data-hovered": isCellHovered, onClick: handleCellClick, onMouseEnter: handleCellMouseEnter, onMouseLeave: handleCellMouseLeave, children: renderCell(value, item, column, cellState) }, column.key));
                            }
                            // Default cell rendering
                            return (jsxs("div", { className: mergeClasses(styles$1.cell, classes?.cell), style: {
                                    width: typeof column.width === 'number'
                                        ? `${column.width}px`
                                        : column.width,
                                }, "data-column": column.key, "data-hovered": isCellHovered, onClick: handleCellClick, onMouseEnter: handleCellMouseEnter, onMouseLeave: handleCellMouseLeave, children: [columnIndex === 0 && item.icon && (jsx("span", { className: styles$1.icon, children: item.icon })), value] }, column.key));
                        }) }));
                }) })] }));
});
ListView.displayName = 'ListView';

var styles = {"folderListContent":"FolderList-module_folderListContent","listView":"FolderList-module_listView"};

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
const FolderList = forwardRef(({ columns = [
    { key: 'name', label: 'Name', width: '40%' },
    { key: 'modified', label: 'Date Modified', width: '30%' },
    { key: 'size', label: 'Size', width: '30%' },
], items, selectedIds, onSelectionChange, onItemOpen, onItemMouseEnter, onItemMouseLeave, onSort, onMouseEnter, listHeight = 400, classes, renderRow, renderCell, renderHeaderCell, onCellClick, onCellMouseEnter, onCellMouseLeave, ...windowProps }, ref) => {
    // Build ListView classes from FolderList classes
    const listViewClasses = classes ? {
        root: classes.listView,
        header: classes.header,
        headerCell: classes.headerCell,
        body: classes.body,
        row: classes.row,
        cell: classes.cell,
    } : undefined;
    // Window content with ListView
    return (jsx(Window, { ref: ref, contentClassName: styles.folderListContent, onMouseEnter: onMouseEnter, className: classes?.root, ...windowProps, children: jsx(ListView, { columns: columns, items: items, selectedIds: selectedIds, onSelectionChange: onSelectionChange, onItemOpen: onItemOpen, onItemMouseEnter: onItemMouseEnter, onItemMouseLeave: onItemMouseLeave, onSort: onSort, height: listHeight, className: styles.listView, classes: listViewClasses, renderRow: renderRow, renderCell: renderCell, renderHeaderCell: renderHeaderCell, onCellClick: onCellClick, onCellMouseEnter: onCellMouseEnter, onCellMouseLeave: onCellMouseLeave }) }));
});
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

export { Button, Checkbox, Dialog, DividerIcon, FolderList, Icon, IconButton, IconLibrary, ListView, MenuBar, MenuDropdown, MenuItem, Radio, RadioGroup, Scrollbar, Select, TabPanel, Tabs, TextField, Window, borders, colors, createClassBuilder, mergeClasses, shadows, spacing, tokens, transitions, typography, zIndex };
