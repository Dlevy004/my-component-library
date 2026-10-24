import type { ReactNode } from "react";

// Storybook-only stand-in: React 19 hoists <title>, <meta> and <link> into <head>
export function Head({ children }: { readonly children?: ReactNode }) {
	return <>{children}</>;
}