import * as React$1 from 'react';
import React__default, { AnchorHTMLAttributes, ButtonHTMLAttributes, SVGAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseButtonProps {
    /**
     * Button variant
     * @default 'default'
     */
    variant?: 'default' | 'primary' | 'danger';
    /**
     * Button size
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Whether the button is disabled
     * @default false
     */
    disabled?: boolean;
    /**
     * Whether the button should take full width
     * @default false
     */
    fullWidth?: boolean;
    /**
     * Loading state - shows loading indicator and disables interaction
     * @default false
     */
    loading?: boolean;
    /**
     * Text to show when loading (replaces children)
     */
    loadingText?: string;
    /**
     * Use Mac OS 9 style watch cursor during loading
     * @default false
     */
    useCursorLoading?: boolean;
    /**
     * Icon to display before the button text
     */
    leftIcon?: React__default.ReactNode;
    /**
     * Icon to display after the button text
     */
    rightIcon?: React__default.ReactNode;
    /**
     * If true, only displays the icon.
     *
     * An icon-only button has no visible text, so it needs an accessible name.
     * Supply `aria-label`. If `children` happens to be a plain string it is
     * used as a fallback, but any other node type — an `<svg>`, a component,
     * a fragment — cannot produce a name, and in development the component
     * logs an error rather than shipping an unlabelled control.
     */
    iconOnly?: boolean;
    /**
     * Render the child element instead of a `<button>`, merging Button's
     * className and props into it.
     *
     * This is the integration point for router link components — Next.js
     * `<Link>`, React Router `<Link>`, TanStack Router, and so on — which
     * need to own the element they render.
     *
     * Expects exactly one React element child.
     *
     * @default false
     *
     * @example
     * ```tsx
     * import Link from 'next/link';
     *
     * <Button asChild variant="primary">
     *   <Link href="/dashboard">Go to Dashboard</Link>
     * </Button>
     * ```
     */
    asChild?: boolean;
    /**
     * Override aria-label.
     * @deprecated Use the standard `aria-label` attribute instead. This alias
     * remains for backwards compatibility; `aria-label` wins if both are set.
     */
    ariaLabel?: string;
    /**
     * ID of element that describes this button.
     * @deprecated Use the standard `aria-describedby` attribute instead.
     */
    ariaDescribedBy?: string;
    /**
     * For toggle buttons - indicates pressed state.
     * @deprecated Use the standard `aria-pressed` attribute instead.
     */
    ariaPressed?: boolean;
    /**
     * Additional CSS class names
     */
    className?: string;
    /**
     * Button content
     */
    children: React__default.ReactNode;
}
interface ButtonAsButton extends BaseButtonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> {
    /**
     * Render as button element
     * @default 'button'
     */
    as?: 'button';
    /**
     * Associate button with a form by ID
     */
    form?: string;
    /**
     * Override form action URL
     */
    formAction?: string;
    /**
     * Override form method
     */
    formMethod?: 'get' | 'post';
    /**
     * Skip form validation
     */
    formNoValidate?: boolean;
    /**
     * Where to display form response
     */
    formTarget?: string;
}
interface ButtonAsLink extends BaseButtonProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> {
    /**
     * Render as anchor element
     */
    as: 'a';
    /**
     * URL for the link
     */
    href: string;
    /**
     * Where to open the link
     */
    target?: '_blank' | '_self' | '_parent' | '_top';
    /**
     * Relationship of linked resource
     * Auto-fills "noopener noreferrer" for external links if not provided
     */
    rel?: string;
    /**
     * Prompt to download the linked resource
     */
    download?: boolean | string;
}
type ButtonProps = ButtonAsButton | ButtonAsLink;
/**
 * Call signature for Button.
 *
 * `forwardRef` can only be given one ref type, so a polymorphic component
 * declared with it ends up with `HTMLButtonElement | HTMLAnchorElement` and
 * every consumer has to cast their ref. Overloading the call signature lets
 * the `as` prop pick the ref type instead, so `useRef<HTMLAnchorElement>`
 * type-checks against `<Button as="a">` with no cast.
 */
interface ButtonComponent {
    (props: ButtonAsLink & {
        ref?: React__default.Ref<HTMLAnchorElement>;
    }): React__default.ReactElement | null;
    (props: ButtonAsButton & {
        ref?: React__default.Ref<HTMLButtonElement>;
    }): React__default.ReactElement | null;
    displayName?: string;
}
declare const Button: ButtonComponent;

interface IconProps extends SVGAttributes<SVGElement> {
    /**
     * Icon size
     * @default 'md'
     */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /**
     * Icon content (SVG path or element)
     */
    children: React__default.ReactNode;
    /**
     * Optional label for accessibility
     */
    label?: string;
    /**
     * Additional CSS class names
     */
    className?: string;
}
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
declare const Icon: React__default.ForwardRefExoticComponent<IconProps & React__default.RefAttributes<SVGSVGElement>>;

/**
 * One row of an icon per string, one character per pixel.
 *
 * Recognised characters:
 *
 * - `#` — the icon's own colour (`currentColor`, so it inherits text colour)
 * - `o` — highlight, the light edge of a Mac OS 9 bevel
 * - `x` — shade, the dark edge of a bevel
 * - `.` or a space — transparent
 */
type PixelMap = readonly string[];
/**
 * Builds an icon component from a pixel map.
 *
 * @param displayName - React display name, e.g. `FolderIcon`
 * @param label - Default accessible name
 * @param map - The pixel map, one string per row
 * @param gridSize - Width/height of the square pixel grid
 */
declare function createPixelIcon(displayName: string, label: string, map: PixelMap, gridSize?: number): React__default.FC<PixelIconProps>;
/**
 * Props accepted by every generated pixel icon.
 *
 * Pass `label={null}` for a purely decorative icon that sits next to its own
 * text — repeating the name to a screen reader is noise.
 */
interface PixelIconProps extends Omit<React__default.ComponentProps<typeof Icon>, 'children' | 'label'> {
    /** Accessible name. Defaults to the icon's own name; `null` hides it. */
    label?: string | null;
}

/**
 * Central icon registry
 * Maps icon names to their components
 */
declare const iconRegistry: {
    readonly close: React$1.FC<PixelIconProps>;
    readonly trash: React$1.FC<PixelIconProps>;
    readonly search: React$1.FC<PixelIconProps>;
    readonly copy: React$1.FC<PixelIconProps>;
    readonly print: React$1.FC<PixelIconProps>;
    readonly download: React$1.FC<PixelIconProps>;
    readonly link: React$1.FC<PixelIconProps>;
    readonly mail: React$1.FC<PixelIconProps>;
    readonly folder: React$1.FC<PixelIconProps>;
    readonly folderOpen: React$1.FC<PixelIconProps>;
    readonly document: React$1.FC<PixelIconProps>;
    readonly application: React$1.FC<PixelIconProps>;
    readonly disk: React$1.FC<PixelIconProps>;
    readonly hardDrive: React$1.FC<PixelIconProps>;
    readonly image: React$1.FC<PixelIconProps>;
    readonly music: React$1.FC<PixelIconProps>;
    readonly arrowUp: React$1.FC<PixelIconProps>;
    readonly arrowDown: React$1.FC<PixelIconProps>;
    readonly arrowLeft: React$1.FC<PixelIconProps>;
    readonly arrowRight: React$1.FC<PixelIconProps>;
    readonly home: React$1.FC<PixelIconProps>;
    readonly play: React$1.FC<PixelIconProps>;
    readonly pause: React$1.FC<PixelIconProps>;
    readonly stop: React$1.FC<PixelIconProps>;
    readonly volume: React$1.FC<PixelIconProps>;
    readonly volumeMute: React$1.FC<PixelIconProps>;
    readonly alert: React$1.FC<PixelIconProps>;
    readonly info: React$1.FC<PixelIconProps>;
    readonly error: React$1.FC<PixelIconProps>;
    readonly check: React$1.FC<PixelIconProps>;
    readonly question: React$1.FC<PixelIconProps>;
    readonly divider: React$1.FC<PixelIconProps>;
    readonly resizeHandle: React$1.FC<PixelIconProps>;
    readonly grabber: React$1.FC<PixelIconProps>;
    readonly chevronRight: React$1.FC<PixelIconProps>;
    readonly chevronDown: React$1.FC<PixelIconProps>;
    readonly user: React$1.FC<PixelIconProps>;
    readonly lock: React$1.FC<PixelIconProps>;
    readonly calendar: React$1.FC<PixelIconProps>;
};
/**
 * Type-safe icon names
 * Auto-generated from the icon registry
 */
type IconName = keyof typeof iconRegistry;
/**
 * Get icon component by name
 * @param name - The icon name from the registry
 * @returns The icon component
 */
declare function getIcon(name: IconName): React$1.FC<PixelIconProps>;
/**
 * Check if an icon exists in the registry
 * @param name - The icon name to check
 * @returns True if the icon exists
 */
declare function hasIcon(name: string): name is IconName;
/**
 * Get all available icon names
 * @returns Array of all icon names
 */
declare function getAllIconNames(): IconName[];

interface IconLibraryProps extends Omit<PixelIconProps, 'label'> {
    /**
     * Icon name from the registry
     */
    icon: IconName;
    /**
     * Accessible name. Each icon carries a sensible default — `folder`
     * announces as "Folder" — so this is only needed when the icon means
     * something more specific in context. Pass `null` for a decorative icon
     * that sits beside its own text label.
     */
    label?: string | null;
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
declare const IconLibrary: React__default.FC<IconLibraryProps>;

/**
 * Icon component type.
 *
 * Every icon accepts the presentational props of the base Icon — `size`,
 * `className`, `label`, and any SVG attribute. It was previously declared as
 * a bare `React.FC`, which said icons took no props at all and made
 * forwarding `size` through IconLibrary a type error.
 */
type IconComponent = React__default.FC<PixelIconProps>;
/**
 * Icon category types
 * Used to organize icons into logical groups
 */
type IconCategory = 'actions' | 'files' | 'navigation' | 'media' | 'status' | 'ui';

/** Close cross. */
declare const CloseIcon: React$1.FC<PixelIconProps>;
/** Wastebasket. */
declare const TrashIcon: React$1.FC<PixelIconProps>;
/** Magnifying glass. */
declare const SearchIcon: React$1.FC<PixelIconProps>;
/** Two stacked sheets. */
declare const CopyIcon: React$1.FC<PixelIconProps>;
/** Dot-matrix printer. */
declare const PrintIcon: React$1.FC<PixelIconProps>;
/** Downward arrow into a tray. */
declare const DownloadIcon: React$1.FC<PixelIconProps>;
/** Chain link. */
declare const LinkIcon: React$1.FC<PixelIconProps>;
/** Sealed envelope. */
declare const MailIcon: React$1.FC<PixelIconProps>;

/** Classic Mac OS folder with its tab. */
declare const FolderIcon: React$1.FC<PixelIconProps>;
/** Folder shown mid-open, used for the current location in a path. */
declare const FolderOpenIcon: React$1.FC<PixelIconProps>;
/** Plain document with a folded corner. */
declare const DocumentIcon: React$1.FC<PixelIconProps>;
/** Application diamond, the Mac OS 9 marker for an executable. */
declare const ApplicationIcon: React$1.FC<PixelIconProps>;
/** 3.5" floppy disk, the save icon of the era. */
declare const DiskIcon: React$1.FC<PixelIconProps>;
/** Hard disk volume, as it appears on the desktop. */
declare const HardDriveIcon: React$1.FC<PixelIconProps>;
/** Picture document. */
declare const ImageIcon: React$1.FC<PixelIconProps>;
/** Music document. */
declare const MusicIcon: React$1.FC<PixelIconProps>;

/** Solid triangle pointing up. Matches the scrollbar arrows. */
declare const ArrowUpIcon: React$1.FC<PixelIconProps>;
/** Solid triangle pointing down. */
declare const ArrowDownIcon: React$1.FC<PixelIconProps>;
/** Solid triangle pointing left. */
declare const ArrowLeftIcon: React$1.FC<PixelIconProps>;
/** Solid triangle pointing right. */
declare const ArrowRightIcon: React$1.FC<PixelIconProps>;
/** House, for a home or root destination. */
declare const HomeIcon: React$1.FC<PixelIconProps>;

/** Play triangle. */
declare const PlayIcon: React$1.FC<PixelIconProps>;
/** Pause bars. */
declare const PauseIcon: React$1.FC<PixelIconProps>;
/** Stop square. */
declare const StopIcon: React$1.FC<PixelIconProps>;
/** Speaker with sound waves. */
declare const VolumeIcon: React$1.FC<PixelIconProps>;
/** Speaker with mute cross. */
declare const VolumeMuteIcon: React$1.FC<PixelIconProps>;

/** Caution triangle, as used by Mac OS 9 caution alerts. */
declare const AlertIcon: React$1.FC<PixelIconProps>;
/** Note alert. */
declare const InfoIcon: React$1.FC<PixelIconProps>;
/** Stop alert. */
declare const ErrorIcon: React$1.FC<PixelIconProps>;
/** Checkmark, for menu items and confirmations. */
declare const CheckIcon: React$1.FC<PixelIconProps>;
/** Question alert. */
declare const QuestionIcon: React$1.FC<PixelIconProps>;

/**
 * Divider icon
 * Vertical divider for menu bars and toolbars
 * Note: Uses a 10x32 viewBox instead of standard 24x24
 */
declare const DividerIcon: React__default.FC<PixelIconProps>;
/** Bevelled grow box, matching the Window resize handle. */
declare const ResizeHandleIcon: React__default.FC<PixelIconProps>;
/** Textured drag grip, for title bars and splitters. */
declare const GrabberIcon: React__default.FC<PixelIconProps>;
/** Small disclosure triangle, pointing right (collapsed). */
declare const ChevronRightIcon: React__default.FC<PixelIconProps>;
/** Small disclosure triangle, pointing down (expanded). */
declare const ChevronDownIcon: React__default.FC<PixelIconProps>;
/** Head and shoulders. */
declare const UserIcon: React__default.FC<PixelIconProps>;
/** Closed padlock. */
declare const LockIcon: React__default.FC<PixelIconProps>;
/** Wall calendar. */
declare const CalendarIcon: React__default.FC<PixelIconProps>;

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Icon element to display
     */
    icon: React__default.ReactNode;
    /**
     * Optional text label to display alongside icon
     */
    label?: string;
    /**
     * Label position relative to icon
     * @default 'right'
     */
    labelPosition?: 'left' | 'right' | 'top' | 'bottom';
    /**
     * Button variant
     * @default 'default'
     */
    variant?: 'default' | 'primary' | 'danger';
    /**
     * Button size
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Whether button is disabled
     * @default false
     */
    disabled?: boolean;
    /**
     * Additional CSS class names
     */
    className?: string;
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
declare const IconButton: React__default.ForwardRefExoticComponent<IconButtonProps & React__default.RefAttributes<HTMLButtonElement>>;

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
    /**
     * Whether the checkbox is checked
     * For controlled component usage
     */
    checked?: boolean;
    /**
     * Default checked state
     * For uncontrolled component usage
     */
    defaultChecked?: boolean;
    /**
     * Whether the checkbox is in an indeterminate state
     * (neither checked nor unchecked, typically for "select all" scenarios)
     * @default false
     */
    indeterminate?: boolean;
    /**
     * Whether the checkbox is disabled
     * @default false
     */
    disabled?: boolean;
    /**
     * Label text for the checkbox
     */
    label?: React__default.ReactNode;
    /**
     * Position of the label relative to the checkbox
     * @default 'right'
     */
    labelPosition?: 'left' | 'right';
    /**
     * Size of the checkbox
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Error state for form validation
     * @default false
     */
    error?: boolean;
    /**
     * Override aria-label (for checkboxes without visible labels)
     */
    ariaLabel?: string;
    /**
     * ID of element that describes this checkbox
     */
    ariaDescribedBy?: string;
    /**
     * Additional CSS class names
     */
    className?: string;
    /**
     * Callback when checked state changes
     */
    onChange?: (event: React__default.ChangeEvent<HTMLInputElement>) => void;
}
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
declare const Checkbox: React__default.ForwardRefExoticComponent<CheckboxProps & React__default.RefAttributes<HTMLInputElement>>;

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
    /**
     * Whether the radio is checked
     * For controlled component usage
     */
    checked?: boolean;
    /**
     * Default checked state
     * For uncontrolled component usage
     */
    defaultChecked?: boolean;
    /**
     * Whether the radio is disabled
     * @default false
     */
    disabled?: boolean;
    /**
     * Label text for the radio
     */
    label?: React__default.ReactNode;
    /**
     * Position of the label relative to the radio
     * @default 'right'
     */
    labelPosition?: 'left' | 'right';
    /**
     * Size of the radio
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Error state for form validation
     * @default false
     */
    error?: boolean;
    /**
     * Override aria-label (for radios without visible labels)
     */
    ariaLabel?: string;
    /**
     * ID of element that describes this radio
     */
    ariaDescribedBy?: string;
    /**
     * Additional CSS class names
     */
    className?: string;
    /**
     * Value for the radio button (required for radio groups)
     */
    value?: string | number;
    /**
     * Name for the radio group (all radios in a group should share the same name).
     * When the radio is rendered inside a <RadioGroup>, the group's `name` wins.
     */
    name?: string;
    /**
     * Callback when checked state changes
     */
    onChange?: (event: React__default.ChangeEvent<HTMLInputElement>) => void;
}
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
declare const Radio: React__default.ForwardRefExoticComponent<RadioProps & React__default.RefAttributes<HTMLInputElement>>;
/**
 * Props accepted by <RadioGroup>.
 */
interface RadioGroupProps {
    /**
     * Shared name for every <Radio> in the group. When omitted, a stable
     * auto-generated id is used so radios in the same group are linked.
     */
    name?: string;
    /**
     * Controlled selected value. Pair with `onChange`.
     */
    value?: string | number;
    /**
     * Uncontrolled initial value.
     */
    defaultValue?: string | number;
    /**
     * Fires when the user picks a different option.
     */
    onChange?: (value: string | number) => void;
    /**
     * Disable every radio in the group at once.
     */
    disabled?: boolean;
    /**
     * Layout direction. Also controls which arrow keys advance the
     * selection: vertical uses Up/Down, horizontal uses Left/Right.
     * @default 'vertical'
     */
    orientation?: 'vertical' | 'horizontal';
    /**
     * Accessible name for the group. Provide this unless you wire
     * `ariaLabelledBy` to a visible heading.
     */
    ariaLabel?: string;
    /**
     * ID of a visible label element for the group.
     */
    ariaLabelledBy?: string;
    /**
     * Additional CSS class names applied to the group wrapper.
     */
    className?: string;
    /**
     * One or more <Radio> elements.
     */
    children: React__default.ReactNode;
}
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
declare const RadioGroup: React__default.ForwardRefExoticComponent<RadioGroupProps & React__default.RefAttributes<HTMLDivElement>>;

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /**
     * Label text for the text field
     */
    label?: React__default.ReactNode;
    /**
     * Position of the label relative to the text field
     * @default 'top'
     */
    labelPosition?: 'top' | 'left' | 'right';
    /**
     * Size of the text field
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Whether the text field takes full width of its container
     * @default false
     */
    fullWidth?: boolean;
    /**
     * Error state for form validation
     * @default false
     */
    error?: boolean;
    /**
     * Error message to display below the field
     */
    errorMessage?: string;
    /**
     * Helper text to display below the field
     */
    helperText?: string;
    /**
     * Icon to display before the input (left side)
     */
    leftIcon?: React__default.ReactNode;
    /**
     * Icon to display after the input (right side)
     */
    rightIcon?: React__default.ReactNode;
    /**
     * Override aria-label
     */
    ariaLabel?: string;
    /**
     * ID of element that describes this text field
     */
    ariaDescribedBy?: string;
    /**
     * Additional CSS class names
     */
    className?: string;
    /**
     * Custom wrapper class name
     */
    wrapperClassName?: string;
    /**
     * Render a multi-line field (a `<textarea>`) instead of a single-line
     * `<input>`.
     *
     * Everything else — label, sizes, icons, error and helper text, the
     * Mac OS 9 inset bevel — behaves identically, so a comment box does not
     * have to be styled from scratch to sit next to the other fields.
     *
     * @default false
     */
    multiline?: boolean;
    /**
     * Visible rows when `multiline` is set.
     * @default 3
     */
    rows?: number;
    /**
     * How politely the error message is announced when it appears.
     *
     * The message is rendered in a live region so assistive tech announces
     * validation failures as they happen; previously it was a plain
     * paragraph, silently appearing for anyone not looking at that part of
     * the screen. Use `'off'` when your form announces errors centrally and
     * per-field announcements would double up.
     *
     * @default 'polite'
     */
    errorLiveRegion?: 'polite' | 'assertive' | 'off';
    /**
     * Extra props forwarded to the underlying `<textarea>` when `multiline`
     * is set — anything specific to textareas, such as `wrap`.
     */
    textareaProps?: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, keyof InputHTMLAttributes<HTMLInputElement>>;
}
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
declare const TextField: React__default.ForwardRefExoticComponent<TextFieldProps & React__default.RefAttributes<HTMLInputElement | HTMLTextAreaElement>>;

/** A single choice in the list. */
interface SelectOption<TValue extends string | number = string> {
    value: TValue;
    label: string;
    disabled?: boolean;
    /**
     * Optional group heading. Consecutive options sharing a group are drawn
     * under one heading, replacing what `<optgroup>` did for the native
     * control.
     */
    group?: string;
}
interface SelectProps<TValue extends string | number = string> {
    /** Label text for the select */
    label?: React__default.ReactNode;
    /**
     * Position of the label relative to the select
     * @default 'top'
     */
    labelPosition?: 'top' | 'left' | 'right';
    /**
     * Size of the select
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Whether the select takes full width of its container
     * @default false
     */
    fullWidth?: boolean;
    /**
     * Error state for form validation
     * @default false
     */
    error?: boolean;
    /** Error message to display below the field */
    errorMessage?: string;
    /** Helper text to display below the field */
    helperText?: string;
    /** Options for the select dropdown */
    options: readonly SelectOption<TValue>[];
    /** Selected value (controlled) */
    value?: TValue;
    /** Initial selected value (uncontrolled) */
    defaultValue?: TValue;
    /** Called with the newly selected value */
    onValueChange?: (value: TValue) => void;
    /** Placeholder shown when nothing is selected */
    placeholder?: string;
    /** Whether the control is disabled */
    disabled?: boolean;
    /** Whether a value is required for form validation */
    required?: boolean;
    /** Name used when the control participates in a form */
    name?: string;
    /** Override aria-label */
    'aria-label'?: string;
    /** ID of element that describes this select */
    'aria-describedby'?: string;
    /** Element id */
    id?: string;
    /** Additional CSS class names */
    className?: string;
}
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
declare const Select: <TValue extends string | number = string>(props: SelectProps<TValue> & {
    ref?: React__default.Ref<HTMLButtonElement>;
}) => React__default.JSX.Element;

interface TabPanelProps<TValue extends string = string> {
    /**
     * Label for the tab
     */
    label: string;
    /**
     * Content of the tab panel
     */
    children: React__default.ReactNode;
    /**
     * Optional icon to display in the tab
     */
    icon?: React__default.ReactNode;
    /**
     * Whether this tab is disabled
     * @default false
     */
    disabled?: boolean;
    /**
     * Value identifier for controlled tabs.
     *
     * Generic, so a literal union such as `'general' | 'advanced'` survives
     * into `onChange` instead of being widened to `string`.
     */
    value?: TValue;
}
/**
 * TabPanel component - Individual tab content
 * Must be used as a child of Tabs component
 */
declare function TabPanel<TValue extends string = string>({ children, }: TabPanelProps<TValue>): React__default.JSX.Element;
declare namespace TabPanel {
    var displayName: string;
}
interface TabsProps<TValue extends string = string> {
    /**
     * Tab panels as children.
     *
     * Typed as ReactNode rather than `ReactElement<TabPanelProps>[]`: the
     * stricter type rejected every ordinary way of building a tab list —
     * `{condition && <TabPanel …/>}`, a `<>…</>` wrapper, `null` from a map —
     * even though the runtime handled all of them. Non-element children are
     * filtered out at render time.
     */
    children: React__default.ReactNode;
    /**
     * Index of the default active tab (uncontrolled)
     * @default 0
     */
    defaultActiveTab?: number;
    /**
     * Index of the active tab (controlled)
     */
    activeTab?: number;
    /**
     * Callback when tab changes
     */
    onChange?: (index: number, value?: TValue) => void;
    /**
     * Size of the tabs
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Whether tabs take full width
     * @default false
     */
    fullWidth?: boolean;
    /**
     * Custom class name for the container
     */
    className?: string;
    /**
     * Custom class name for the tab list
     */
    tabListClassName?: string;
    /**
     * Custom class name for the tab panel container
     */
    panelClassName?: string;
    /**
     * ARIA label for the tab list
     * @default 'Tabs'
     */
    ariaLabel?: string;
    /**
     * ID of an element that labels the tab list. Takes precedence over
     * `ariaLabel`.
     */
    ariaLabelledBy?: string;
}
declare const Tabs: <TValue extends string = string>(props: TabsProps<TValue> & {
    ref?: React__default.Ref<HTMLDivElement>;
}) => React__default.ReactElement | null;

/**
 * Generic classes object for targeting sub-elements within components.
 * Components extend this with specific element keys.
 *
 * There is deliberately no `[key: string]: string | undefined` index
 * signature. With one, every component-specific classes type — WindowClasses,
 * ListViewClasses — silently accepted any key at all, so a typo like
 * `titlebar` for `titleBar` type-checked and then did nothing at runtime.
 * Component types satisfy this constraint structurally without it.
 */
interface ComponentClasses {
    root?: string;
}
/**
 * Base component props that all components should extend
 * @template TClasses - Specific classes type for the component
 */
interface BaseComponentProps<TClasses extends ComponentClasses = ComponentClasses> {
    /** Additional CSS class name for root element */
    className?: string;
    /** Inline styles */
    style?: React.CSSProperties;
    /** Custom classes for targeting sub-elements */
    classes?: TClasses;
    /** Test ID for testing purposes */
    'data-testid'?: string;
}
/**
 * Common render state interface for render prop patterns
 * Provides information about element state for conditional rendering
 */
interface RenderState {
    /** Whether the element is being hovered */
    isHovered?: boolean;
    /** Whether the element is selected */
    isSelected?: boolean;
    /** Whether the element is in active state (e.g., pressed) */
    isActive?: boolean;
    /** Whether the element has keyboard focus */
    isFocused?: boolean;
    /** Whether the element is disabled */
    isDisabled?: boolean;
}
/**
 * Common variant types for Mac OS 9 components.
 *
 * This mirrors what the components actually accept. It previously read
 * `'default' | 'primary' | 'secondary'` while Button and IconButton
 * implemented `'default' | 'primary' | 'danger'` — so the exported type
 * named a variant no component had and omitted one every component did.
 */
type Variant = 'default' | 'primary' | 'danger';
/**
 * Common size types.
 *
 * Abbreviated to match the components. The exported type previously read
 * `'small' | 'medium' | 'large'` while every component's `size` prop took
 * `'sm' | 'md' | 'lg'`, making the shared type unusable with any of them.
 */
type Size = 'sm' | 'md' | 'lg';
/**
 * Common state types
 */
type State = 'default' | 'hover' | 'active' | 'disabled' | 'focused';
/**
 * Window position for draggable windows
 */
interface WindowPosition {
    x: number;
    y: number;
}
/**
 * Component ref types
 */
type ButtonRef = HTMLButtonElement;
type InputRef = HTMLInputElement;
type SelectRef = HTMLSelectElement;
type TextAreaRef = HTMLTextAreaElement;
type DivRef = HTMLDivElement;

/**
 * Classes for targeting Window sub-elements
 */
interface WindowClasses {
    /** Root container */
    root?: string;
    /** Title bar */
    titleBar?: string;
    /** Title text */
    titleText?: string;
    /** Window controls container */
    controls?: string;
    /** Individual control button */
    controlButton?: string;
    /** Content area */
    content?: string;
    /** Resize handle (grow box) */
    resizeHandle?: string;
}
interface WindowProps {
    /**
     * Window content
     */
    children: React__default.ReactNode;
    /**
     * Window title (displays in title bar if no titleBar prop provided)
     */
    title?: string;
    /**
     * Custom title bar component
     * If provided, overrides the default title bar
     */
    titleBar?: React__default.ReactNode;
    /**
     * Whether window is active/focused.
     *
     * Defaults to `true` because the common case is a single standalone
     * window, which Mac OS 9 always renders in its active state. When you
     * render several windows, drive this from your own focus state
     * alongside `onActivate`.
     *
     * @default true
     */
    active?: boolean;
    /**
     * Width of the window
     * @default 'auto'
     */
    width?: number | string;
    /**
     * Height of the window
     * @default 'auto'
     */
    height?: number | string;
    /**
     * Custom class name for the window container
     */
    className?: string;
    /**
     * Custom class name for the content area
     */
    contentClassName?: string;
    /**
     * Custom classes for targeting sub-elements
     */
    classes?: WindowClasses;
    /**
     * Whether to show window controls (close, minimize, maximize)
     * @default true
     */
    showControls?: boolean;
    /**
     * Callback when close button is clicked
     */
    onClose?: () => void;
    /**
     * Callback when minimize button is clicked
     */
    onMinimize?: () => void;
    /**
     * Callback when maximize button is clicked
     */
    onMaximize?: () => void;
    /**
     * Callback when mouse enters the window
     */
    onMouseEnter?: (event: React__default.MouseEvent<HTMLDivElement>) => void;
    /**
     * Called when the user interacts with any part of the window (pointer
     * down or keyboard focus entering it).
     *
     * Use this together with `zIndex` and `active` to implement
     * click-to-front behaviour across a set of windows — the library
     * deliberately does not own a global window manager, because stacking
     * order belongs to the app that knows about all the windows.
     *
     * @example
     * ```tsx
     * const [order, setOrder] = useState(['a', 'b']);
     * const raise = (id: string) =>
     *   setOrder((prev) => [...prev.filter((w) => w !== id), id]);
     *
     * {order.map((id, i) => (
     *   <Window
     *     key={id}
     *     zIndex={i + 1}
     *     active={order[order.length - 1] === id}
     *     onActivate={() => raise(id)}
     *   />
     * ))}
     * ```
     */
    onActivate?: () => void;
    /**
     * Explicit stacking order for the window. Applied as CSS `z-index` on
     * the root element. Pair with `onActivate` for click-to-front.
     *
     * Inside a `<WindowManagerProvider>` the manager assigns the z-index by
     * stack position and this prop is ignored — set it only for windows you
     * are stacking by hand.
     */
    zIndex?: number;
    /**
     * Stable identity for this window within a `<WindowManagerProvider>`.
     * Defaults to a generated id. Supply one when windows mount and unmount
     * and you want stack position to survive.
     */
    id?: string;
    /**
     * Whether the window has a resize handle.
     *
     * Mac OS 9 windows resize from the bottom-right "grow box" only — there
     * are no edge or corner handles on the other three sides. The handle is
     * keyboard operable: focus it and use the arrow keys.
     *
     * @default false
     */
    resizable?: boolean;
    /**
     * Minimum width when resizing
     * @default 200
     */
    minWidth?: number;
    /**
     * Minimum height when resizing
     * @default 100
     */
    minHeight?: number;
    /**
     * Maximum width when resizing
     */
    maxWidth?: number;
    /**
     * Maximum height when resizing
     */
    maxHeight?: number;
    /**
     * Callback when window is resized
     * Only called when resizable is true
     */
    onResize?: (size: {
        width: number;
        height: number;
    }) => void;
    /**
     * Whether the window can be dragged by its title bar.
     *
     * The window starts in normal flow and becomes absolutely positioned
     * once it has a position. The title bar is also focusable and moves
     * with the arrow keys.
     *
     * @default false
     */
    draggable?: boolean;
    /**
     * Initial position for draggable windows (uncontrolled)
     * Only used when draggable is true
     */
    defaultPosition?: WindowPosition;
    /**
     * Controlled position for draggable windows.
     * Only used when draggable is true. Supplying this at any point — including
     * after mount — immediately positions the window.
     */
    position?: WindowPosition;
    /**
     * Callback when window position changes (during drag or keyboard move)
     * Only called when draggable is true
     */
    onPositionChange?: (position: WindowPosition) => void;
    /**
     * How drag movement is constrained.
     *
     * - `'parent'` (default) — at least 24px of the title bar always stays
     *   inside the parent / offsetParent so the user can't lose the window
     *   by flinging it off-screen.
     * - `'none'` — no constraint. Caller is responsible for keeping the
     *   window reachable.
     *
     * @default 'parent'
     */
    boundary?: 'parent' | 'none';
    /**
     * Pixels moved per arrow-key press when dragging or resizing with the
     * keyboard. Holding Shift multiplies the step by 10.
     * @default 1
     */
    keyboardStep?: number;
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
declare const Window: React__default.ForwardRefExoticComponent<WindowProps & React__default.RefAttributes<HTMLDivElement>>;

/**
 * Elements that can hold focus.
 *
 * `initialFocus` was typed `RefObject<HTMLElement>`, which accepts a ref to
 * any element at all — a `<div>`, a `<span>` — including ones that cannot
 * take focus, so the mistake only showed up at runtime as focus silently
 * staying on the trigger.
 */
type FocusableElement = HTMLAnchorElement | HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | (HTMLElement & {
    tabIndex: number;
});
interface DialogProps extends Omit<WindowProps, 'active'> {
    /**
     * Whether the dialog is open
     * @default false
     */
    open?: boolean;
    /**
     * Callback when dialog should close
     * Called when backdrop is clicked or Escape is pressed
     */
    onClose?: () => void;
    /**
     * Whether clicking the backdrop closes the dialog
     * @default true
     */
    closeOnBackdropClick?: boolean;
    /**
     * Whether pressing Escape closes the dialog
     * @default true
     */
    closeOnEscape?: boolean;
    /**
     * Custom backdrop className
     */
    backdropClassName?: string;
    /**
     * Whether to trap focus within the dialog
     * @default true
     */
    trapFocus?: boolean;
    /**
     * Initial focus target. May be a CSS selector or a ref to a known
     * element inside the dialog. When omitted, focus moves to the first
     * focusable element in the dialog (or the dialog container itself
     * if none exists), as required by the WAI-ARIA dialog pattern.
     *
     * **Security note:** when supplied as a string, the value is passed to
     * `querySelector`. Treat it as a developer-supplied static selector —
     * never derive it from untrusted input.
     */
    initialFocus?: string | React__default.RefObject<FocusableElement | null>;
    /**
     * ARIA role. Use `'alertdialog'` for destructive or error confirmations
     * so assistive tech announces them more assertively.
     * @default 'dialog'
     */
    role?: 'dialog' | 'alertdialog';
    /**
     * Accessible name for the dialog. If omitted and the Window `title`
     * prop is a string, the title is used as the accessible name. Provide
     * this explicitly when `title` is a React node.
     */
    ariaLabel?: string;
    /**
     * ID of a visible element that labels the dialog. Takes precedence over
     * `ariaLabel` if both are provided.
     */
    ariaLabelledBy?: string;
    /**
     * ID of a visible element that describes the dialog body.
     */
    ariaDescribedBy?: string;
    /**
     * Where the dialog is portalled to.
     *
     * Defaults to `document.body`. A modal rendered inline sits inside
     * whatever stacking contexts its ancestors created — a parent with
     * `transform`, `filter`, `opacity` below 1, or its own `z-index` traps
     * the backdrop underneath sibling content no matter how high the
     * dialog's own z-index is. Portalling to the body escapes all of them.
     *
     * Pass an element to portal somewhere else, or `null` to render inline
     * (useful inside a Storybook docs block, or when the host page already
     * provides a modal root).
     */
    container?: HTMLElement | null;
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
declare const Dialog: React__default.ForwardRefExoticComponent<DialogProps & React__default.RefAttributes<HTMLDivElement>>;

/** Coordination surface consumed by Window. */
interface WindowManagerContextValue {
    /** Add a window to the stack; returns nothing, safe to call repeatedly. */
    register: (id: string) => void;
    /** Remove a window from the stack when it unmounts. */
    unregister: (id: string) => void;
    /** Move a window to the top of the stack and make it active. */
    raise: (id: string) => void;
    /** Resolved z-index for a window, by stack order. */
    getZIndex: (id: string) => number;
    /** The id of the topmost (focused) window, or null when none. */
    activeId: string | null;
}
/**
 * Read the surrounding WindowManager, or `null` when there isn't one.
 * Window uses the null case to fall back to its own props.
 */
declare function useWindowManager(): WindowManagerContextValue | null;
interface WindowManagerProviderProps {
    children: React__default.ReactNode;
    /**
     * z-index assigned to the bottom-most window. Each window above it gets
     * `baseZIndex + its stack position`.
     * @default 100
     */
    baseZIndex?: number;
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
declare function WindowManagerProvider({ children, baseZIndex, }: WindowManagerProviderProps): React__default.JSX.Element;

/**
 * A dropdown entry described as data rather than JSX.
 *
 * `Menu.items` accepts either React nodes or an array of these. The data form
 * exists because the JSX-only shape made menus impossible to serialise, diff,
 * or drive from a CMS, an API response, or a config file — anything that
 * wanted a menu had to construct React elements first.
 */
interface MenuItemData {
    /** Item label text */
    label: string;
    /** Keyboard shortcut to display, e.g. "⌘S" */
    shortcut?: string;
    /** Whether the item is disabled */
    disabled?: boolean;
    /** Whether the item shows a checkmark */
    checked?: boolean;
    /** Whether a separator line follows this item */
    separator?: boolean;
    /** Icon rendered before the label */
    icon?: React__default.ReactNode;
    /** Invoked when the item is chosen */
    onClick?: () => void;
    /** Nested submenu entries */
    submenu?: readonly MenuItemData[];
}
interface Menu {
    /**
     * Menu label (displayed in the menu bar)
     */
    label: string;
    /**
     * Menu type - determines behavior
     * @default 'dropdown'
     */
    type?: 'dropdown' | 'link';
    /**
     * Menu items (content of the dropdown).
     *
     * Either React nodes — typically `<MenuItem>` elements — or an array of
     * {@link MenuItemData}, which MenuBar renders for you.
     *
     * Required when type is 'dropdown'
     */
    items?: React__default.ReactNode | readonly MenuItemData[];
    /**
     * Link href (for link-type menus)
     * Used when type is 'link'
     */
    href?: string;
    /**
     * Click handler (for link-type menus)
     * Used when type is 'link'
     */
    onClick?: () => void;
    /**
     * Whether the menu is disabled
     * @default false
     */
    disabled?: boolean;
}
interface MenuBarProps {
    /**
     * Array of menus to display. Never mutated by MenuBar.
     */
    menus: readonly Menu[];
    /**
     * Index of the currently open menu (controlled).
     *
     * Pair with `onMenuOpen` / `onMenuClose`. For the uncontrolled equivalent
     * use `defaultOpenMenuIndex`.
     */
    openMenuIndex?: number;
    /**
     * Index of the menu open on first render (uncontrolled).
     *
     * Every controllable prop in the library follows the same `X` /
     * `defaultX` pairing — `activeTab` / `defaultActiveTab` on Tabs,
     * `position` / `defaultPosition` on Window. MenuBar had only the
     * controlled half.
     */
    defaultOpenMenuIndex?: number;
    /**
     * Callback when a menu is opened
     */
    onMenuOpen?: (index: number) => void;
    /**
     * Callback when menus are closed
     */
    onMenuClose?: () => void;
    /**
     * Custom class name for the menu bar
     */
    className?: string;
    /**
     * Custom class name for menu dropdowns
     */
    dropdownClassName?: string;
    /**
     * Content to display on the left side (typically a logo)
     */
    leftContent?: React__default.ReactNode;
    /**
     * Content to display on the right side (status items, clock, etc.)
     * Can be a single element or array of elements
     */
    rightContent?: React__default.ReactNode | React__default.ReactNode[];
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
declare const MenuBar: React__default.ForwardRefExoticComponent<MenuBarProps & React__default.RefAttributes<HTMLDivElement>>;

interface MenuItemProps {
    /**
     * Menu item label text
     */
    label: string;
    /**
     * Optional keyboard shortcut to display (e.g., "⌘S", "Ctrl+O").
     *
     * The displayed form is also exposed to assistive tech via
     * `aria-keyshortcuts`, translated into the format that attribute requires
     * (`⌘S` becomes `Meta+S`). Pass {@link MenuItemProps.keyShortcut} if the
     * automatic translation is wrong for your notation.
     */
    shortcut?: string;
    /**
     * Explicit `aria-keyshortcuts` value, overriding the value derived from
     * `shortcut`. Use the format from the ARIA specification — modifiers
     * `Alt`, `Control`, `Meta`, `Shift`, joined to the key with `+`.
     *
     * @example "Meta+Shift+S"
     */
    keyShortcut?: string;
    /**
     * Whether the menu item is disabled
     * @default false
     */
    disabled?: boolean;
    /**
     * Whether the menu item is selected/active
     * @default false
     */
    selected?: boolean;
    /**
     * Whether the menu item has a separator after it
     * @default false
     */
    separator?: boolean;
    /**
     * Whether the menu item has a checkmark (for toggle items)
     * @default false
     */
    checked?: boolean;
    /**
     * Optional icon to display before the label
     */
    icon?: React__default.ReactNode;
    /**
     * Callback when menu item is clicked
     */
    onClick?: (event: React__default.MouseEvent<HTMLButtonElement>) => void;
    /**
     * Callback when menu item is focused
     */
    onFocus?: (event: React__default.FocusEvent<HTMLButtonElement>) => void;
    /**
     * Callback when menu item loses focus
     */
    onBlur?: (event: React__default.FocusEvent<HTMLButtonElement>) => void;
    /**
     * Custom class name for the menu item
     */
    className?: string;
    /**
     * Whether the item has a submenu indicator (arrow)
     * @default false
     */
    hasSubmenu?: boolean;
    /**
     * Submenu items
     */
    items?: React__default.ReactNode;
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
declare const MenuItem: React__default.ForwardRefExoticComponent<MenuItemProps & React__default.RefAttributes<HTMLButtonElement>>;

interface MenuDropdownProps {
    /**
     * Menu label (displayed in the menu bar/button)
     */
    label: React__default.ReactNode;
    /**
     * Menu items (content of the dropdown)
     */
    items: React__default.ReactNode;
    /**
     * Whether the menu is disabled
     * @default false
     */
    disabled?: boolean;
    /**
     * Custom class name for the menu container
     */
    className?: string;
    /**
     * Custom class name for menu dropdown
     */
    dropdownClassName?: string;
    /**
     * Preferred alignment of the dropdown menu.
     *
     * This is a preference, not a guarantee: if the menu would overflow the
     * viewport it is nudged back into view. Set `avoidCollisions` to `false`
     * to keep the alignment exactly as specified.
     *
     * @default 'left'
     */
    align?: 'left' | 'right';
    /**
     * Whether to reposition the dropdown when it would render outside the
     * viewport — shifted horizontally, and flipped above the trigger when
     * there is no room below.
     *
     * @default true
     */
    avoidCollisions?: boolean;
}
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
declare const MenuDropdown: React__default.ForwardRefExoticComponent<MenuDropdownProps & React__default.RefAttributes<HTMLDivElement>>;

interface ScrollbarProps {
    /**
     * Scrollbar orientation
     * @default 'vertical'
     */
    orientation?: 'vertical' | 'horizontal';
    /**
     * Current scroll position (0-1)
     */
    value?: number;
    /**
     * Viewport size relative to content size (0-1).
     *
     * This is the one number that makes a scrollbar meaningful: it sets the
     * thumb's proportion of the track and the PageUp/PageDown step. Compute
     * it as `clientHeight / scrollHeight` (or the width equivalent) for the
     * region being scrolled.
     *
     * There is deliberately no default. It previously defaulted to `0.2`, so
     * a scrollbar wired up without it rendered a confident, entirely
     * fictional thumb covering a fifth of the track — whatever the content's
     * real length — and looked correct while being wrong. Omitting it now
     * logs a development warning and falls back to a full-length thumb,
     * which reads as "nothing to scroll" rather than as a plausible lie.
     */
    viewportRatio?: number;
    /**
     * Callback when scroll position changes
     */
    onChange?: (value: number) => void;
    /**
     * Additional CSS class names
     */
    className?: string;
    /**
     * Whether scrollbar is disabled
     * @default false
     */
    disabled?: boolean;
    /**
     * Accessible label for the scrollbar track. Required for AT users
     * unless `controls` points at an element with a known accessible name.
     */
    ariaLabel?: string;
    /**
     * ID of the scrollable region this scrollbar controls. Surfaces as
     * `aria-controls` per WAI-ARIA scrollbar pattern.
     */
    controls?: string;
    /**
     * Per-keystroke increment for Arrow keys, expressed as a fraction of
     * the full track (0-1).
     * @default 0.1
     */
    step?: number;
}
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
declare const Scrollbar: React__default.ForwardRefExoticComponent<ScrollbarProps & React__default.RefAttributes<HTMLDivElement>>;

interface ListColumn {
    /**
     * Column key/identifier
     */
    key: string;
    /**
     * Column header label
     */
    label: string;
    /**
     * Column width (px or percentage)
     * @default 'auto'
     */
    width?: number | string;
    /**
     * Whether column is sortable
     * @default true
     */
    sortable?: boolean;
}
/**
 * A row in a ListView.
 *
 * The index signature is `unknown`, not `any`. `any` disabled type checking
 * on every property read from a row — `item.nmae` compiled, and so did
 * `item.size.toFixed(2)` on a string. Parameterise `ListView` with your own
 * row type to get real types back:
 *
 * ```tsx
 * interface FileRow extends ListItem {
 *   name: string;
 *   size: number;
 * }
 *
 * <ListView<FileRow> items={files} columns={columns} />
 * ```
 */
interface ListItem {
    /**
     * Unique item ID
     */
    id: string;
    /**
     * Optional icon to display
     */
    icon?: React__default.ReactNode;
    /**
     * Item data - keys should match column keys
     */
    [key: string]: unknown;
}
/**
 * Classes for targeting ListView sub-elements
 */
interface ListViewClasses {
    /** Root container */
    root?: string;
    /** Header row container */
    header?: string;
    /** Individual header cell */
    headerCell?: string;
    /** Body container (scrollable area) */
    body?: string;
    /** Individual row */
    row?: string;
    /** Individual cell */
    cell?: string;
    /** Empty-state container */
    empty?: string;
    /** Loading-state container */
    loading?: string;
}
/**
 * Row render prop state
 */
interface RowRenderState {
    /** Whether this row is selected */
    isSelected: boolean;
    /** Whether this row is being hovered */
    isHovered: boolean;
    /** Row index in the list */
    index: number;
}
/**
 * Row render prop default props
 * Spread these on your custom element for accessibility and behavior
 */
interface RowDefaultProps {
    key: string;
    id: string;
    className: string;
    /** Listbox option semantics — spread these to keep the row accessible. */
    role: 'option';
    'aria-selected': boolean;
    /** Roving tabindex: 0 on the active row, -1 on the rest. */
    tabIndex: number;
    onKeyDown: (e: React__default.KeyboardEvent) => void;
    onClick: (e: React__default.MouseEvent) => void;
    onDoubleClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    'data-selected': boolean;
    'data-index': number;
    'data-item-id': string;
}
/**
 * Cell render prop state
 */
interface CellRenderState {
    /** Whether this cell is being hovered */
    isHovered: boolean;
    /** Whether the row containing this cell is selected */
    isRowSelected: boolean;
    /** Column index */
    columnIndex: number;
    /** Row index */
    rowIndex: number;
}
/**
 * Header cell render prop state
 */
interface HeaderCellRenderState {
    /** Whether this column is currently sorted */
    isSorted: boolean;
    /** Current sort direction if sorted */
    sortDirection?: 'asc' | 'desc';
}
/**
 * Header cell render prop default props
 */
interface HeaderCellDefaultProps {
    key: string;
    className: string;
    style: React__default.CSSProperties;
    onClick: () => void;
    /** Present on sortable columns, which behave as buttons. */
    role?: 'button';
    tabIndex?: number;
    'aria-sort'?: 'ascending' | 'descending';
    onKeyDown?: (event: React__default.KeyboardEvent) => void;
    'data-column': string;
    'data-sortable': boolean;
    'data-sorted'?: boolean;
    'data-sort-direction'?: 'asc' | 'desc';
}
interface ListViewProps<TItem extends ListItem = ListItem> {
    /**
     * Column definitions.
     *
     * Declared `readonly` because ListView never mutates it — this lets you
     * pass an `as const` array or a frozen array without a cast.
     */
    columns: readonly ListColumn[];
    /**
     * List items. Never mutated by ListView.
     */
    items: readonly TItem[];
    /**
     * Selected item IDs. Never mutated by ListView.
     */
    selectedIds?: readonly string[];
    /**
     * Callback when selection changes
     */
    onSelectionChange?: (selectedIds: string[]) => void;
    /**
     * Callback when item is double-clicked
     */
    onItemOpen?: (item: TItem) => void;
    /**
     * Callback when mouse enters an item (row-level)
     */
    onItemMouseEnter?: (item: TItem) => void;
    /**
     * Callback when mouse leaves an item (row-level)
     */
    onItemMouseLeave?: (item: TItem) => void;
    /**
     * Callback when column is clicked for sorting
     */
    onSort?: (columnKey: string, direction: 'asc' | 'desc') => void;
    /**
     * Additional CSS class names
     */
    className?: string;
    /**
     * Height of the list view
     */
    height?: number | string;
    /**
     * Custom classes for targeting sub-elements
     */
    classes?: ListViewClasses;
    /**
     * Accessible name for the list.
     *
     * The rows form a listbox, and a listbox needs a name for a screen reader
     * to announce what is being chosen from. Supply this, or `ariaLabelledBy`
     * pointing at a visible heading.
     *
     * @default 'List'
     */
    ariaLabel?: string;
    /**
     * ID of a visible element naming the list. Takes precedence over
     * `ariaLabel`.
     */
    ariaLabelledBy?: string;
    /**
     * Content shown in place of the rows when `items` is empty and the list
     * is not loading. Without this the component renders an empty box, which
     * reads as a broken list rather than an empty one.
     *
     * @default 'No items'
     */
    emptyState?: React__default.ReactNode;
    /**
     * Whether the list is waiting on data. While true, `loadingState` is
     * shown instead of the rows and the body is marked `aria-busy`.
     *
     * @default false
     */
    loading?: boolean;
    /**
     * Content shown in place of the rows while `loading` is true.
     *
     * @default 'Loading…'
     */
    loadingState?: React__default.ReactNode;
    /**
     * Override row rendering
     * @param item - The list item
     * @param state - Row state (selected, hovered, index)
     * @param defaultProps - Props to spread on custom element for accessibility
     * @returns Custom row element (fully replaces default)
     */
    renderRow?: (item: TItem, state: RowRenderState, defaultProps: RowDefaultProps) => React__default.ReactNode;
    /**
     * Override cell rendering
     * @param value - Cell value (item[columnKey])
     * @param item - Full item object
     * @param column - Column definition
     * @param state - Cell state (hovered, selected row, indices)
     * @returns Custom cell content (fully replaces default)
     */
    renderCell?: (value: unknown, item: TItem, column: ListColumn, state: CellRenderState) => React__default.ReactNode;
    /**
     * Override header cell rendering
     * @param column - Column definition
     * @param state - Header state (sorted, direction)
     * @param defaultProps - Props to spread on custom element
     * @returns Custom header cell element (fully replaces default)
     */
    renderHeaderCell?: (column: ListColumn, state: HeaderCellRenderState, defaultProps: HeaderCellDefaultProps) => React__default.ReactNode;
    /**
     * Callback when a cell is clicked
     */
    onCellClick?: (item: TItem, column: ListColumn, event: React__default.MouseEvent) => void;
    /**
     * Callback when mouse enters a cell
     */
    onCellMouseEnter?: (item: TItem, column: ListColumn) => void;
    /**
     * Callback when mouse leaves a cell
     */
    onCellMouseLeave?: (item: TItem, column: ListColumn) => void;
}
/**
 * `forwardRef` erases generics, so the forwarded component is re-cast to a
 * signature that keeps `TItem`. This is what lets `<ListView<FileRow> …>`
 * infer the row type in `renderCell`, `onItemOpen` and friends.
 */
declare const ListView: <TItem extends ListItem = ListItem>(props: ListViewProps<TItem> & {
    ref?: React__default.Ref<HTMLDivElement>;
}) => React__default.ReactElement | null;

/**
 * Classes for targeting FolderList sub-elements
 */
interface FolderListClasses {
    /** Root window container */
    root?: string;
    /** Window component */
    window?: string;
    /** Title bar */
    titleBar?: string;
    /** ListView container */
    listView?: string;
    /** ListView header */
    header?: string;
    /** ListView header cell */
    headerCell?: string;
    /** ListView body */
    body?: string;
    /** ListView row */
    row?: string;
    /** ListView cell */
    cell?: string;
}
/**
 * The ListView props FolderList passes straight through.
 *
 * Derived from ListViewProps rather than re-declared. The previous version
 * hand-copied a dozen of these declarations, so every ListView signature
 * change had to be mirrored here by hand or the two would drift apart —
 * and `columns`, `draggable`, `position` and friends were duplicated from
 * WindowProps as well, which already supplies them.
 *
 * `columns` is re-declared below because FolderList gives it a default;
 * `className`, `classes` and `height` are owned by FolderList itself.
 */
type ForwardedListViewProps<TItem extends ListItem> = Omit<ListViewProps<TItem>, 'columns' | 'className' | 'classes' | 'height'>;
interface FolderListProps<TItem extends ListItem = ListItem> extends Omit<WindowProps, 'children' | 'classes'>, ForwardedListViewProps<TItem> {
    /**
     * Column definitions for the list
     * @default [{ key: 'name', label: 'Name' }, { key: 'modified', label: 'Date Modified' }, { key: 'size', label: 'Size' }]
     */
    columns?: readonly ListColumn[];
    /**
     * Height of the list view area
     * @default 400
     */
    listHeight?: number | string;
    /**
     * Custom classes for targeting sub-elements
     */
    classes?: FolderListClasses;
}
/**
 * `forwardRef` erases generics, so the forwarded component is re-cast to a
 * signature that keeps `TItem` — matching how ListView is exported.
 */
declare const FolderList: <TItem extends ListItem = ListItem>(props: FolderListProps<TItem> & {
    ref?: React__default.Ref<HTMLDivElement>;
}) => React__default.ReactElement | null;

/**
 * Color tokens based on Mac OS 9 grayscale palette
 * Extracted from Figma styles and component analysis
 */
declare const colors: {
    readonly gray100: "#FFFFFF";
    readonly gray200: "#EEEEEE";
    readonly gray300: "#DDDDDD";
    readonly gray400: "#CCCCCC";
    readonly gray450: "#CBCBCB";
    readonly gray475: "#C5C5C5";
    readonly gray500: "#BBBBBB";
    readonly gray550: "#999999";
    readonly gray600: "#666666";
    readonly gray650: "#555555";
    readonly gray700: "#4D4D4D";
    readonly gray800: "#333333";
    readonly gray900: "#262626";
    readonly lavender: "#CCCCFF";
    readonly azul: "#0066CC";
    readonly linkRed: "#CC0000";
    readonly blueHighlight: "#0000BB";
    readonly background: "#EEEEEE";
    readonly foreground: "#262626";
    readonly border: "#262626";
    readonly text: "#262626";
    readonly textInverse: "#FFFFFF";
    readonly surface: "#EEEEEE";
    readonly surfaceInset: "#FFFFFF";
    readonly surfaceRaised: "#DDDDDD";
    readonly borderInset: "#555555";
    readonly highlight: "#0000BB";
    readonly highlightText: "#FFFFFF";
    readonly black: "#262626";
    readonly white: "#FFFFFF";
    readonly focus: "#000080";
    readonly error: "#CC0000";
    readonly success: "#008000";
    readonly warning: "#FF8C00";
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
declare const typography: {
    readonly fontFamily: {
        readonly system: "'Pixel', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
        readonly body: "'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
        readonly display: "'Pixel', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
        readonly title: "'EB Garamond', Garamond, Georgia, 'Times New Roman', serif";
        readonly mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace";
        readonly pixel: "'Pixel', ui-sans-serif, system-ui, sans-serif";
        readonly pixelSmall: "'PixelSmall', 'Pixel', ui-sans-serif, system-ui, sans-serif";
    };
    readonly fontSize: {
        readonly xs: "0.5625rem";
        readonly sm: "0.625rem";
        readonly md: "0.75rem";
        readonly lg: "0.8125rem";
        readonly xl: "0.875rem";
        readonly '2xl': "1rem";
        readonly '3xl': "1.125rem";
        readonly '4xl': "1.25rem";
        readonly '5xl': "1.5rem";
    };
    readonly fontWeight: {
        readonly regular: 400;
        readonly light: 400;
        readonly normal: 700;
        readonly medium: 700;
        readonly semibold: 700;
        readonly bold: 700;
    };
    readonly lineHeight: {
        readonly tight: 1.2;
        readonly snug: 1.3;
        readonly normal: 1.4;
        readonly relaxed: 1.5;
        readonly loose: 1.6;
    };
    readonly letterSpacing: {
        readonly tighter: "-0.02em";
        readonly tight: "-0.01em";
        readonly normal: "0";
        readonly wide: "0.01em";
        readonly wider: "0.02em";
    };
};
/**
 * Spacing tokens based on Mac OS 9 measurements
 * Mac OS 9 used tight spacing; using 2px as base unit
 */
declare const spacing: {
    readonly '0': "0";
    readonly px: "1px";
    readonly '0.5': "2px";
    readonly '1': "4px";
    readonly '1.5': "6px";
    readonly '2': "8px";
    readonly '2.5': "10px";
    readonly '3': "12px";
    readonly '4': "16px";
    readonly '5': "20px";
    readonly '6': "24px";
    readonly '8': "32px";
    readonly '10': "40px";
    readonly '12': "48px";
    readonly '16': "64px";
    readonly xs: "2px";
    readonly sm: "4px";
    readonly md: "8px";
    readonly lg: "12px";
    readonly xl: "16px";
    readonly '2xl': "24px";
    readonly '3xl': "32px";
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
declare const shadows: {
    readonly bevel: "inset 2px 2px 0 rgba(255, 255, 255, 0.6), inset -2px -2px 0 rgba(38, 38, 38, 0.4), 2px 2px 0 rgba(38, 38, 38, 1)";
    readonly inset: "inset -2px -2px 0 rgba(255, 255, 255, 0.6), inset 2px 2px 0 rgba(38, 38, 38, 0.4), inset 0px 0px 0px rgba(38, 38, 38, 1)";
    readonly dropShadow: "2px 2px 0 rgba(38, 38, 38, 1)";
    readonly innerHighlight: "inset 2px 2px 0 rgba(255, 255, 255, 0.6)";
    readonly innerShadow: "inset -2px -2px 0 rgba(38, 38, 38, 0.4)";
    readonly float: "2px 2px 0 rgba(0, 0, 0, 0.5)";
    readonly raised: {
        readonly highlight: "inset 2px 2px 0 rgba(255, 255, 255, 0.6)";
        readonly shadow: "inset -2px -2px 0 rgba(38, 38, 38, 0.4)";
        readonly full: "inset 2px 2px 0 rgba(255, 255, 255, 0.6), inset -2px -2px 0 rgba(38, 38, 38, 0.4), 2px 2px 0 rgba(38, 38, 38, 1)";
    };
    readonly none: "none";
};
/**
 * Border tokens
 * Mac OS 9 used consistent 1px borders with sharp corners
 */
declare const borders: {
    readonly width: {
        readonly none: "0";
        readonly thin: "1px";
        readonly medium: "2px";
        readonly thick: "3px";
    };
    readonly style: {
        readonly solid: "solid";
        readonly dashed: "dashed";
        readonly dotted: "dotted";
        readonly none: "none";
    };
    readonly radius: {
        readonly none: "0";
        readonly sm: "0";
        readonly md: "0";
        readonly lg: "0";
        readonly full: "0";
    };
};
/**
 * Z-index scale for layering
 */
declare const zIndex: {
    readonly base: 0;
    readonly dropdown: 1000;
    readonly sticky: 1100;
    readonly modal: 1200;
    readonly popover: 1300;
    readonly tooltip: 1400;
};
/**
 * Transition/Animation tokens
 * Mac OS 9 had minimal animations, but we add subtle ones for modern feel
 */
declare const transitions: {
    readonly duration: {
        readonly instant: "0ms";
        readonly fast: "100ms";
        readonly normal: "200ms";
        readonly slow: "300ms";
    };
    readonly timing: {
        readonly linear: "linear";
        readonly easeIn: "cubic-bezier(0.4, 0, 1, 1)";
        readonly easeOut: "cubic-bezier(0, 0, 0.2, 1)";
        readonly easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)";
    };
};
declare const tokens: {
    readonly colors: {
        readonly gray100: "#FFFFFF";
        readonly gray200: "#EEEEEE";
        readonly gray300: "#DDDDDD";
        readonly gray400: "#CCCCCC";
        readonly gray450: "#CBCBCB";
        readonly gray475: "#C5C5C5";
        readonly gray500: "#BBBBBB";
        readonly gray550: "#999999";
        readonly gray600: "#666666";
        readonly gray650: "#555555";
        readonly gray700: "#4D4D4D";
        readonly gray800: "#333333";
        readonly gray900: "#262626";
        readonly lavender: "#CCCCFF";
        readonly azul: "#0066CC";
        readonly linkRed: "#CC0000";
        readonly blueHighlight: "#0000BB";
        readonly background: "#EEEEEE";
        readonly foreground: "#262626";
        readonly border: "#262626";
        readonly text: "#262626";
        readonly textInverse: "#FFFFFF";
        readonly surface: "#EEEEEE";
        readonly surfaceInset: "#FFFFFF";
        readonly surfaceRaised: "#DDDDDD";
        readonly borderInset: "#555555";
        readonly highlight: "#0000BB";
        readonly highlightText: "#FFFFFF";
        readonly black: "#262626";
        readonly white: "#FFFFFF";
        readonly focus: "#000080";
        readonly error: "#CC0000";
        readonly success: "#008000";
        readonly warning: "#FF8C00";
    };
    readonly typography: {
        readonly fontFamily: {
            readonly system: "'Pixel', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
            readonly body: "'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
            readonly display: "'Pixel', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
            readonly title: "'EB Garamond', Garamond, Georgia, 'Times New Roman', serif";
            readonly mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace";
            readonly pixel: "'Pixel', ui-sans-serif, system-ui, sans-serif";
            readonly pixelSmall: "'PixelSmall', 'Pixel', ui-sans-serif, system-ui, sans-serif";
        };
        readonly fontSize: {
            readonly xs: "0.5625rem";
            readonly sm: "0.625rem";
            readonly md: "0.75rem";
            readonly lg: "0.8125rem";
            readonly xl: "0.875rem";
            readonly '2xl': "1rem";
            readonly '3xl': "1.125rem";
            readonly '4xl': "1.25rem";
            readonly '5xl': "1.5rem";
        };
        readonly fontWeight: {
            readonly regular: 400;
            readonly light: 400;
            readonly normal: 700;
            readonly medium: 700;
            readonly semibold: 700;
            readonly bold: 700;
        };
        readonly lineHeight: {
            readonly tight: 1.2;
            readonly snug: 1.3;
            readonly normal: 1.4;
            readonly relaxed: 1.5;
            readonly loose: 1.6;
        };
        readonly letterSpacing: {
            readonly tighter: "-0.02em";
            readonly tight: "-0.01em";
            readonly normal: "0";
            readonly wide: "0.01em";
            readonly wider: "0.02em";
        };
    };
    readonly spacing: {
        readonly '0': "0";
        readonly px: "1px";
        readonly '0.5': "2px";
        readonly '1': "4px";
        readonly '1.5': "6px";
        readonly '2': "8px";
        readonly '2.5': "10px";
        readonly '3': "12px";
        readonly '4': "16px";
        readonly '5': "20px";
        readonly '6': "24px";
        readonly '8': "32px";
        readonly '10': "40px";
        readonly '12': "48px";
        readonly '16': "64px";
        readonly xs: "2px";
        readonly sm: "4px";
        readonly md: "8px";
        readonly lg: "12px";
        readonly xl: "16px";
        readonly '2xl': "24px";
        readonly '3xl': "32px";
    };
    readonly borders: {
        readonly width: {
            readonly none: "0";
            readonly thin: "1px";
            readonly medium: "2px";
            readonly thick: "3px";
        };
        readonly style: {
            readonly solid: "solid";
            readonly dashed: "dashed";
            readonly dotted: "dotted";
            readonly none: "none";
        };
        readonly radius: {
            readonly none: "0";
            readonly sm: "0";
            readonly md: "0";
            readonly lg: "0";
            readonly full: "0";
        };
    };
    readonly shadows: {
        readonly bevel: "inset 2px 2px 0 rgba(255, 255, 255, 0.6), inset -2px -2px 0 rgba(38, 38, 38, 0.4), 2px 2px 0 rgba(38, 38, 38, 1)";
        readonly inset: "inset -2px -2px 0 rgba(255, 255, 255, 0.6), inset 2px 2px 0 rgba(38, 38, 38, 0.4), inset 0px 0px 0px rgba(38, 38, 38, 1)";
        readonly dropShadow: "2px 2px 0 rgba(38, 38, 38, 1)";
        readonly innerHighlight: "inset 2px 2px 0 rgba(255, 255, 255, 0.6)";
        readonly innerShadow: "inset -2px -2px 0 rgba(38, 38, 38, 0.4)";
        readonly float: "2px 2px 0 rgba(0, 0, 0, 0.5)";
        readonly raised: {
            readonly highlight: "inset 2px 2px 0 rgba(255, 255, 255, 0.6)";
            readonly shadow: "inset -2px -2px 0 rgba(38, 38, 38, 0.4)";
            readonly full: "inset 2px 2px 0 rgba(255, 255, 255, 0.6), inset -2px -2px 0 rgba(38, 38, 38, 0.4), 2px 2px 0 rgba(38, 38, 38, 1)";
        };
        readonly none: "none";
    };
    readonly zIndex: {
        readonly base: 0;
        readonly dropdown: 1000;
        readonly sticky: 1100;
        readonly modal: 1200;
        readonly popover: 1300;
        readonly tooltip: 1400;
    };
    readonly transitions: {
        readonly duration: {
            readonly instant: "0ms";
            readonly fast: "100ms";
            readonly normal: "200ms";
            readonly slow: "300ms";
        };
        readonly timing: {
            readonly linear: "linear";
            readonly easeIn: "cubic-bezier(0.4, 0, 1, 1)";
            readonly easeOut: "cubic-bezier(0, 0, 0.2, 1)";
            readonly easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)";
        };
    };
};

interface UseOutsideClickOptions {
    /** Whether the listener is active. */
    enabled?: boolean;
    /** Elements that count as "inside" — a click in any of these is ignored. */
    refs: Array<React.RefObject<HTMLElement | null>>;
    /** Called when an interaction lands outside every ref. */
    onOutside: () => void;
}
declare function useOutsideClick({ enabled, refs, onOutside }: UseOutsideClickOptions): void;

/** Resolved placement of an open menu. */
interface MenuPosition {
    /** Style to apply to the floating menu element. */
    style: React.CSSProperties;
    /** Whether the menu was flipped above its trigger. */
    flipped: boolean;
}
interface UseMenuPositionOptions {
    /** Whether the menu is currently open (and therefore measurable). */
    open: boolean;
    /** The trigger the menu is anchored to. */
    anchorRef: React.RefObject<HTMLElement | null>;
    /** The floating menu element. */
    menuRef: React.RefObject<HTMLElement | null>;
    /**
     * Which trigger edge the menu aligns to.
     * @default 'left'
     */
    align?: 'left' | 'right';
    /**
     * Space to keep between the menu and the viewport edge.
     * @default 8
     */
    padding?: number;
}
declare function useMenuPosition({ open, anchorRef, menuRef, align, padding, }: UseMenuPositionOptions): MenuPosition;

/**
 * A value that may be passed to {@link mergeClasses}.
 *
 * Numbers and booleans are accepted because conditional expressions
 * naturally produce them — `count && styles.badge` is `0` when `count` is
 * zero, and `flag && styles.on` is `false` when the flag is off. Only
 * non-empty strings survive into the output.
 */
type ClassValue = string | number | boolean | null | undefined;
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
declare const mergeClasses: (...classes: ClassValue[]) => string;
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
declare const createClassBuilder: (baseClass: string) => (...additionalClasses: ClassValue[]) => string;

export { AlertIcon, ApplicationIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, Button, CalendarIcon, CheckIcon, Checkbox, ChevronDownIcon, ChevronRightIcon, CloseIcon, CopyIcon, Dialog, DiskIcon, DividerIcon, DocumentIcon, DownloadIcon, ErrorIcon, FolderIcon, FolderList, FolderOpenIcon, GrabberIcon, HardDriveIcon, HomeIcon, Icon, IconButton, IconLibrary, ImageIcon, InfoIcon, LinkIcon, ListView, LockIcon, MailIcon, MenuBar, MenuDropdown, MenuItem, MusicIcon, PauseIcon, PlayIcon, PrintIcon, QuestionIcon, Radio, RadioGroup, ResizeHandleIcon, Scrollbar, SearchIcon, Select, StopIcon, TabPanel, Tabs, TextField, TrashIcon, UserIcon, VolumeIcon, VolumeMuteIcon, Window, WindowManagerProvider, borders, colors, createClassBuilder, createPixelIcon, getAllIconNames, getIcon, hasIcon, iconRegistry, mergeClasses, shadows, spacing, tokens, transitions, typography, useMenuPosition, useOutsideClick, useWindowManager, zIndex };
export type { BaseComponentProps, ButtonProps, ButtonRef, CellRenderState, CheckboxProps, ComponentClasses, DialogProps, DivRef, FocusableElement, FolderListClasses, FolderListProps, HeaderCellDefaultProps, HeaderCellRenderState, IconButtonProps, IconCategory, IconComponent, IconLibraryProps, IconName, IconProps, InputRef, ListColumn, ListItem, ListViewClasses, ListViewProps, Menu, MenuBarProps, MenuDropdownProps, MenuItemData, MenuItemProps, MenuPosition, PixelIconProps, PixelMap, RadioGroupProps, RadioProps, RenderState, RowDefaultProps, RowRenderState, ScrollbarProps, SelectOption, SelectProps, SelectRef, Size, State, TabPanelProps, TabsProps, TextAreaRef, TextFieldProps, UseMenuPositionOptions, UseOutsideClickOptions, Variant, WindowClasses, WindowManagerContextValue, WindowManagerProviderProps, WindowPosition, WindowProps };
