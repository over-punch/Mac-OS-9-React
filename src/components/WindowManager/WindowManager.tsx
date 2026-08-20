// WindowManager - z-order and focus coordination for multiple Windows
//
// Before this existed, Window neither accepted nor assigned a z-index and had
// no raise-on-click behaviour, so a partially obscured window stayed buried
// and overlap regions routed clicks to whichever window happened to come
// later in the DOM (issue #24). The `active` prop was purely cosmetic.
//
// Windows opt in by rendering inside a <WindowManagerProvider>. Outside one,
// Window falls back to its own `zIndex` / `active` props and behaves exactly
// as it did before, so this is additive for existing consumers.

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

/** Coordination surface consumed by Window. */
export interface WindowManagerContextValue {
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

const WindowManagerContext = createContext<WindowManagerContextValue | null>(null);

/**
 * Read the surrounding WindowManager, or `null` when there isn't one.
 * Window uses the null case to fall back to its own props.
 */
export function useWindowManager(): WindowManagerContextValue | null {
	return useContext(WindowManagerContext);
}

export interface WindowManagerProviderProps {
	children: React.ReactNode;
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
export function WindowManagerProvider({
	children,
	baseZIndex = 100,
}: WindowManagerProviderProps): React.JSX.Element {
	// Stack order, bottom-most first. The last entry is the active window.
	const [stack, setStack] = useState<string[]>([]);

	// Mirrors `stack` for synchronous reads inside callbacks, so a raise()
	// during an event handler doesn't act on a stale render's array.
	const stackRef = useRef<string[]>([]);
	stackRef.current = stack;

	const register = useCallback((id: string) => {
		setStack((current) => (current.includes(id) ? current : [...current, id]));
	}, []);

	const unregister = useCallback((id: string) => {
		setStack((current) => current.filter((entry) => entry !== id));
	}, []);

	const raise = useCallback((id: string) => {
		setStack((current) => {
			// Already on top — skip the state update entirely so a click on the
			// focused window doesn't re-render the whole stack.
			if (current[current.length - 1] === id) return current;
			const without = current.filter((entry) => entry !== id);
			return [...without, id];
		});
	}, []);

	const getZIndex = useCallback(
		(id: string) => {
			const index = stackRef.current.indexOf(id);
			return index === -1 ? baseZIndex : baseZIndex + index;
		},
		[baseZIndex]
	);

	const value = useMemo<WindowManagerContextValue>(
		() => ({
			register,
			unregister,
			raise,
			getZIndex,
			activeId: stack[stack.length - 1] ?? null,
		}),
		[register, unregister, raise, getZIndex, stack]
	);

	return <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>;
}
