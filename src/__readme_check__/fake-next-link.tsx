// Stands in for next/link so the asChild snippet can be type-checked here.
import type { AnchorHTMLAttributes } from 'react';
export default function Link(props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
	return <a {...props} />;
}
