// BalloonHelp component - Mac OS 9 style
//
// The rounded speech balloon from Help › Show Balloons. Nothing else on the
// system looked like it, and nothing since has: a bubble with a tail pointing
// at whatever you were hovering, explaining what it was.
//
// Mac OS 9 gated it globally — balloons appeared only once you turned them on
// from the Help menu — which is why this ships with a provider. Wrap a tree in
// `BalloonHelpProvider` and you get the switch; leave it out and balloons
// simply work, because a tooltip that silently does nothing by default is a
// worse trap than a missing period detail.
//
// The accessibility here is the part the original had no answer for. A balloon
// that appears only on hover is invisible to keyboard and screen-reader users,
// so this shows on focus as well, describes its trigger with aria-describedby
// rather than replacing the trigger's own name, and dismisses on Escape.

import {
	createContext,
	forwardRef,
	useCallback,
	useContext,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import { mergeClasses } from '../../utils/classNames';
import styles from './BalloonHelp.module.css';

/** Delay before a balloon appears, in milliseconds. */
const OPEN_DELAY = 400;

interface BalloonHelpContextValue {
	/** Whether balloons are switched on. */
	enabled: boolean;
}

const BalloonHelpContext = createContext<BalloonHelpContextValue | null>(null);

export interface BalloonHelpProviderProps {
	/**
	 * Whether balloons show at all — the Help menu's "Show Balloons".
	 * @default true
	 */
	enabled?: boolean;

	children?: ReactNode;
}

/**
 * Global switch for balloon help, as the Help menu was.
 *
 * Optional. Without it, balloons are on.
 *
 * @example
 * ```tsx
 * const [balloons, setBalloons] = useState(false);
 * <BalloonHelpProvider enabled={balloons}>
 *   <App />
 * </BalloonHelpProvider>
 * ```
 */
export function BalloonHelpProvider({ enabled = true, children }: BalloonHelpProviderProps) {
	const value = useMemo(() => ({ enabled }), [enabled]);
	return <BalloonHelpContext.Provider value={value}>{children}</BalloonHelpContext.Provider>;
}

/**
 * Whether balloon help is currently switched on.
 *
 * Useful for a menu item that reflects the state — "Show Balloons" versus
 * "Hide Balloons", as the real Help menu did.
 */
export function useBalloonHelp(): boolean {
	return useContext(BalloonHelpContext)?.enabled ?? true;
}

/**
 * Classes for targeting BalloonHelp sub-elements.
 */
export interface BalloonHelpClasses {
	/** The wrapper around the trigger. */
	root?: string;
	/** The balloon itself. */
	balloon?: string;
}

export interface BalloonHelpProps {
	/**
	 * What the balloon says.
	 */
	content: ReactNode;

	/**
	 * Which side of the trigger the balloon sits on.
	 * @default 'bottom'
	 */
	side?: 'top' | 'bottom' | 'left' | 'right';

	/**
	 * The element the balloon explains.
	 */
	children: ReactNode;

	/**
	 * Additional CSS class names.
	 */
	className?: string;

	/**
	 * Classes for targeting sub-elements.
	 */
	classes?: BalloonHelpClasses;
}

/**
 * Mac OS 9 style balloon help.
 *
 * @example
 * ```tsx
 * <BalloonHelp content="Throws away the items you drag here.">
 *   <IconButton icon={<TrashIcon label={null} />} label="Trash" />
 * </BalloonHelp>
 * ```
 */
export const BalloonHelp = forwardRef<HTMLSpanElement, BalloonHelpProps>(
	({ content, side = 'bottom', children, className = '', classes }, ref) => {
		const enabled = useBalloonHelp();
		const [open, setOpen] = useState(false);
		const timer = useRef<number | undefined>(undefined);
		const balloonId = useId();

		const cancel = useCallback(() => {
			if (timer.current) window.clearTimeout(timer.current);
			timer.current = undefined;
		}, []);

		const show = useCallback(
			(immediate = false) => {
				if (!enabled) return;
				cancel();
				if (immediate) {
					setOpen(true);
					return;
				}
				timer.current = window.setTimeout(() => setOpen(true), OPEN_DELAY);
			},
			[cancel, enabled]
		);

		const hide = useCallback(() => {
			cancel();
			setOpen(false);
		}, [cancel]);

		useEffect(() => cancel, [cancel]);

		// Switching balloons off should take down one that is already up,
		// rather than leaving the last balloon stranded on screen.
		useEffect(() => {
			if (!enabled) setOpen(false);
		}, [enabled]);

		// Escape dismisses without moving focus, which is the documented
		// tooltip behaviour and the only way out for a keyboard user whose
		// balloon is covering what they were reading.
		useEffect(() => {
			if (!open) return;
			const onKeyDown = (event: KeyboardEvent) => {
				if (event.key === 'Escape') hide();
			};
			document.addEventListener('keydown', onKeyDown);
			return () => document.removeEventListener('keydown', onKeyDown);
		}, [open, hide]);

		return (
			<span
				ref={ref}
				className={mergeClasses(styles.anchor, className, classes?.root)}
				onPointerEnter={() => show()}
				onPointerLeave={hide}
				// Focus arrives all at once rather than by hovering toward it,
				// so there is nothing to wait for.
				onFocus={() => show(true)}
				onBlur={hide}
			>
				<span
					className={styles.trigger}
					// Describes rather than labels: the trigger keeps its own
					// name, and the balloon is extra detail about it.
					aria-describedby={open ? balloonId : undefined}
				>
					{children}
				</span>

				{open && (
					<span
						id={balloonId}
						role="tooltip"
						className={mergeClasses(styles.balloon, styles[`balloon--${side}`], classes?.balloon)}
					>
						{content}
					</span>
				)}
			</span>
		);
	}
);

BalloonHelp.displayName = 'BalloonHelp';

export default BalloonHelp;
