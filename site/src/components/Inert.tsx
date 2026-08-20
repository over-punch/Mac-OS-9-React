// Marks a subtree as decorative and non-interactive.
//
// The screen preview in the hero contains a real MenuBar, which has real
// buttons in it. Marking the wrapper `aria-hidden` alone leaves those buttons
// in the tab order — a focusable element inside an aria-hidden subtree, which
// is an actual defect: keyboard users land on a control a screen reader has
// been told does not exist.
//
// `inert` removes the subtree from the tab order and the accessibility tree
// together. It is set through a ref rather than as a JSX prop because React 18
// does not recognise it as a known attribute.

import { useEffect, useRef, type ReactNode } from 'react';

export function Inert({ children, className }: { children: ReactNode; className?: string }) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		node.setAttribute('inert', '');
		return () => node.removeAttribute('inert');
	}, []);

	return (
		<div ref={ref} className={className} aria-hidden="true">
			{children}
		</div>
	);
}
