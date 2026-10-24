"use client";

import type { CSSProperties } from "react";
import { Menu } from "lucide-react";

export interface HamburgerButtonProps {
	/** Accessible label of the button */
	readonly label?: string;
	/** Whether the menu this button controls is open (sets aria-expanded) */
	readonly isOpen?: boolean;
	/** Id of the menu this button controls (sets aria-controls) */
	readonly controls?: string;
	/** Called when the button is clicked */
	readonly onClick?: () => void;
	/** Accent color (button background) */
	readonly accentColor?: string;
	/** Accent color used in dark mode. Pick a light color: the icon turns dark there */
	readonly accentColorDark?: string;
	/** Extra classes, e.g. "lg:hidden" to show the button on small screens only */
	readonly className?: string;
}

export function HamburgerButton({
	label = "Open menu",
	isOpen = false,
	controls,
	onClick,
	accentColor = "#2563eb",
	accentColorDark = "#60a5fa",
	className = "",
}: HamburgerButtonProps) {
	return (
		<button
			type="button"
			aria-label={label}
			aria-expanded={isOpen}
			aria-controls={controls}
			onClick={onClick}
			style={
				{
					"--hamburger-accent": accentColor,
					"--hamburger-accent-dark": accentColorDark,
				} as CSSProperties
			}
			className={`flex size-10 cursor-pointer items-center justify-center rounded-full border-none bg-(--hamburger-accent) text-white transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--hamburger-accent) motion-reduce:transition-none dark:bg-(--hamburger-accent-dark) dark:focus-visible:outline-(--hamburger-accent-dark) ${className}`}
		>
			<Menu aria-hidden="true" strokeWidth={2.5} className="size-[70%]" />
		</button>
	);
}