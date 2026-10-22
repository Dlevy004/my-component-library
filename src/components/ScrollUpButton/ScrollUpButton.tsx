"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { ArrowBigUp } from "lucide-react";

export interface ScrollUpButtonProps {
	/** Accessible label of the button */
	readonly label?: string;
	/** Scroll distance (px) after which the button appears */
	readonly threshold?: number;
	/** Accent color (button background, hover border and icon) */
	readonly accentColor?: string;
	/** Accent color used in dark mode. Pick a color with at least 3:1 contrast on the page background */
	readonly accentColorDark?: string;
}

export function ScrollUpButton({
	label = "Scroll to top",
	threshold = 500,
	accentColor = "#2563eb",
	accentColorDark = "#60a5fa",
}: ScrollUpButtonProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const update = () => setIsVisible(window.scrollY > threshold);

		window.addEventListener("scroll", update, { passive: true });
		// Check once after mount too (the browser may restore the scroll position)
		const id = requestAnimationFrame(update);

		return () => {
			window.removeEventListener("scroll", update);
			cancelAnimationFrame(id);
		};
	}, [threshold]);

	const scrollToTop = () => {
		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
	};

	return (
		<button
			type="button"
			aria-label={label}
			aria-hidden={!isVisible}
			inert={!isVisible}
			onClick={scrollToTop}
			style={
				{
					"--scroll-accent": accentColor,
					"--scroll-accent-dark": accentColorDark,
				} as CSSProperties
			}
			className={`fixed right-[clamp(10px,3vw,20px)] bottom-[clamp(10px,3vw,20px)] z-99 flex size-[clamp(3rem,4.5vw,5rem)] cursor-pointer items-center justify-center rounded-full border-[3px] border-transparent bg-(--scroll-accent) text-neutral-100 transition-all duration-200 ease-in hover:scale-110 hover:border-(--scroll-accent) hover:bg-neutral-100 hover:text-(--scroll-accent) focus-visible:scale-110 focus-visible:border-(--scroll-accent) focus-visible:bg-neutral-100 focus-visible:text-(--scroll-accent) motion-reduce:transition-none dark:hover:border-(--scroll-accent-dark) dark:hover:bg-neutral-800 dark:hover:text-(--scroll-accent-dark) dark:focus-visible:border-(--scroll-accent-dark) dark:focus-visible:bg-neutral-800 dark:focus-visible:text-(--scroll-accent-dark) ${
				isVisible
					? "visible translate-y-0 opacity-100"
					: "invisible translate-y-4 opacity-0"
			}`}
		>
			<ArrowBigUp className="h-3/5 w-full" aria-hidden="true" />
		</button>
	);
}