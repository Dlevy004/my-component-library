import type { ReactNode } from "react";
import { createPortal } from "react-dom";

// Storybook-only stand-in for the real <Head>: renders its children into document.head
export function Head({ children }: { readonly children?: ReactNode }) {
	return createPortal(children, document.head);
}