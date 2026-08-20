// Tabs component - Mac OS 9 style
// Classic tabbed navigation with raised tab appearance

import React, {
	useState,
	useCallback,
	useMemo,
	useId,
	forwardRef,
	Children,
	isValidElement,
	ReactElement,
} from 'react';
import { mergeClasses } from '../../utils/classNames';
import styles from './Tabs.module.css';

export interface TabPanelProps {
	/**
	 * Label for the tab
	 */
	label: string;

	/**
	 * Content of the tab panel
	 */
	children: React.ReactNode;

	/**
	 * Optional icon to display in the tab
	 */
	icon?: React.ReactNode;

	/**
	 * Whether this tab is disabled
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Value identifier for controlled tabs
	 */
	value?: string;
}

/**
 * TabPanel component - Individual tab content
 * Must be used as a child of Tabs component
 */
export const TabPanel: React.FC<TabPanelProps> = ({ children }) => {
	return <>{children}</>;
};

TabPanel.displayName = 'TabPanel';

export interface TabsProps {
	/**
	 * Tab panels as children.
	 *
	 * Typed as ReactNode rather than `ReactElement<TabPanelProps>[]`: the
	 * stricter type rejected every ordinary way of building a tab list —
	 * `{condition && <TabPanel …/>}`, a `<>…</>` wrapper, `null` from a map —
	 * even though the runtime handled all of them. Non-element children are
	 * filtered out at render time.
	 */
	children: React.ReactNode;

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
	onChange?: (index: number, value?: string) => void;

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
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
	{
		children,
		defaultActiveTab = 0,
		activeTab: controlledActiveTab,
		onChange,
		size = 'md',
		fullWidth = false,
		className = '',
		tabListClassName = '',
		panelClassName = '',
		ariaLabel = 'Tabs',
		ariaLabelledBy,
	},
	ref
) {
	// Controlled vs uncontrolled state
	const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState(defaultActiveTab);
	const isControlled = controlledActiveTab !== undefined;
	const activeTabIndex = isControlled ? controlledActiveTab : uncontrolledActiveTab;

	// Unique per Tabs instance. The ids used to be `tab-0` / `panel-0`, which
	// collided the moment a page rendered two Tabs — duplicate DOM ids, and
	// aria-controls on the second set pointing at the first set's panels.
	const baseId = useId();

	// Extract tab information from children.
	//
	// Memoised on `children`: this array was rebuilt on every render and fed
	// into the dependency list of handleTabChange and handleKeyDown, so both
	// callbacks were recreated every render and every tab button's props
	// churned along with them.
	const tabs = useMemo(
		() =>
			Children.toArray(children).filter((child): child is ReactElement<TabPanelProps> =>
				isValidElement(child)
			),
		[children]
	);

	// Handle tab change
	const handleTabChange = useCallback(
		(index: number) => {
			const tab = tabs[index];
			if (!tab || tab.props.disabled) return;

			if (!isControlled) {
				setUncontrolledActiveTab(index);
			}
			onChange?.(index, tab.props.value);
		},
		[tabs, isControlled, onChange]
	);

	// Keyboard navigation
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent, currentIndex: number) => {
			let newIndex: number;

			switch (event.key) {
				case 'ArrowLeft':
				case 'ArrowUp':
					event.preventDefault();
					newIndex = currentIndex - 1;
					if (newIndex < 0) newIndex = tabs.length - 1;
					// Skip disabled tabs
					while (tabs[newIndex]?.props.disabled && newIndex !== currentIndex) {
						newIndex--;
						if (newIndex < 0) newIndex = tabs.length - 1;
					}
					break;
				case 'ArrowRight':
				case 'ArrowDown':
					event.preventDefault();
					newIndex = currentIndex + 1;
					if (newIndex >= tabs.length) newIndex = 0;
					// Skip disabled tabs
					while (tabs[newIndex]?.props.disabled && newIndex !== currentIndex) {
						newIndex++;
						if (newIndex >= tabs.length) newIndex = 0;
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
		},
		[tabs, handleTabChange]
	);

	// Class names
	const containerClassNames = mergeClasses(styles.container, className);

	const tabListClassNames = mergeClasses(
		styles.tabList,
		styles[`tabList--${size}`],
		fullWidth && styles['tabList--full-width'],
		tabListClassName
	);

	const panelContainerClassNames = mergeClasses(
		styles.panelContainer,
		styles[`panelContainer--${size}`],
		panelClassName
	);

	return (
		<div ref={ref} className={containerClassNames}>
			<div
				role="tablist"
				aria-label={ariaLabelledBy ? undefined : ariaLabel}
				aria-labelledby={ariaLabelledBy}
				className={tabListClassNames}
			>
				{tabs.map((tab, index) => {
					const isActive = index === activeTabIndex;
					const isDisabled = tab.props.disabled;

					const tabClassNames = mergeClasses(
						styles.tab,
						styles[`tab--${size}`],
						isActive && styles['tab--active'],
						isDisabled && styles['tab--disabled'],
						fullWidth && styles['tab--full-width']
					);

					return (
						<button
							key={index}
							role="tab"
							type="button"
							aria-selected={isActive}
							aria-controls={`${baseId}-panel-${index}`}
							id={`${baseId}-tab-${index}`}
							tabIndex={isActive ? 0 : -1}
							disabled={isDisabled}
							className={tabClassNames}
							onClick={() => handleTabChange(index)}
							onKeyDown={(e) => handleKeyDown(e, index)}
						>
							{tab.props.icon && <span className={styles.tabIcon}>{tab.props.icon}</span>}
							{tab.props.label}
						</button>
					);
				})}
			</div>

			{tabs.map((tab, index) => {
				const isActive = index === activeTabIndex;
				return (
					<div
						key={index}
						role="tabpanel"
						id={`${baseId}-panel-${index}`}
						aria-labelledby={`${baseId}-tab-${index}`}
						hidden={!isActive}
						// A tab panel must be reachable from the tab list. When the
						// panel holds nothing focusable — static text, an image —
						// Tab from the selected tab skipped straight past the
						// content, so the panel was unreachable by keyboard and
						// unreadable in a screen reader's focus mode.
						tabIndex={isActive ? 0 : undefined}
						className={panelContainerClassNames}
					>
						{isActive && tab.props.children}
					</div>
				);
			})}
		</div>
	);
});

Tabs.displayName = 'Tabs';

export default Tabs;
