"use client";

import {
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type ReactNode,
} from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip);

/** A stop is an element or a CSS selector. Empty values are skipped */
export type ScrollTravelStop = HTMLElement | string | null | undefined;

export interface ScrollTravelProps {
	/** The element that travels, e.g. an image. Its direct child fills the traveler */
	readonly children: ReactNode;
	/** Places to fly to, in order. Each stop is resized and moved onto the stop's box */
	readonly targets: readonly ScrollTravelStop[];
	/** Width and height of the traveler where it starts, as a CSS length */
	readonly size?: string;
	/** Pause between two stops, relative to one flight (0.5 = half as long as a flight) */
	readonly hold?: number;
	/** Seconds the traveler takes to catch up with the scroll position. 0 follows the scroll exactly */
	readonly smoothing?: number;
	/** ScrollTrigger start: when the traveler's starting place reaches the middle of the screen */
	readonly start?: string;
	/** ScrollTrigger end, measured on `endTrigger` */
	readonly end?: string;
	/** Element that marks the end of the journey. Defaults to the last stop */
	readonly endTrigger?: HTMLElement | string | null;
	/** Scrollable element to watch instead of the page, e.g. a panel with overflow-y: auto */
	readonly scrollContainer?: HTMLElement | null;
	/** Extra classes for the traveler */
	readonly className?: string;
}

const resolve = (stop: ScrollTravelStop) =>
	typeof stop === "string"
		? document.querySelector<HTMLElement>(stop)
		: (stop ?? null);

export function ScrollTravel({
	children,
	targets,
	size = "100px",
	hold = 0.5,
	smoothing = 1,
	start = "clamp(top center)",
	end = "clamp(top center)",
	endTrigger,
	scrollContainer,
	className = "",
}: ScrollTravelProps) {
	const anchorRef = useRef<HTMLDivElement>(null);
	const travelerRef = useRef<HTMLDivElement>(null);
	const [layoutKey, setLayoutKey] = useState(0);

	// Stop positions are measured when the animation is built, so rebuild after a resize
	useEffect(() => {
		let timer: ReturnType<typeof setTimeout> | undefined;
		const onResize = () => {
			clearTimeout(timer);
			timer = setTimeout(() => setLayoutKey((key) => key + 1), 150);
		};

		window.addEventListener("resize", onResize);
		return () => {
			window.removeEventListener("resize", onResize);
			clearTimeout(timer);
		};
	}, []);

	// Stops that arrive later (e.g. elements stored in state) rebuild the animation
	const stopCount = targets.filter(Boolean).length;

	useGSAP(
		() => {
			// Visitors who prefer reduced motion get a static element
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

			const anchor = anchorRef.current!; // always set once effects run
			const traveler = travelerRef.current!;
			const stops = targets
				.map(resolve)
				.filter((stop): stop is HTMLElement => stop !== null);
			if (stops.length === 0) return;

			const timeline = gsap.timeline({
				scrollTrigger: {
					// the anchor stays in place, the traveler flies away from it
					trigger: anchor,
					scroller: scrollContainer ?? undefined,
					start,
					endTrigger: endTrigger ?? stops.at(-1),
					end,
					scrub: smoothing > 0 ? smoothing : true,
				},
			});

			stops.forEach((stop, index) => {
				const flight = Flip.fit(traveler, Flip.getState(stop), {
					ease: "none",
					duration: 1,
				}) as gsap.core.Tween;

				if (index === 0) timeline.add(flight);
				else timeline.add(flight, `+=${hold}`);
			});
		},
		{
			dependencies: [
				layoutKey,
				stopCount,
				scrollContainer,
				endTrigger,
				start,
				end,
				hold,
				smoothing,
			],
			revertOnUpdate: true,
		},
	);

	return (
		<div
			ref={anchorRef}
			style={{ "--travel-size": size } as CSSProperties}
			className="relative size-(--travel-size)"
		>
			<div
				ref={travelerRef}
				data-scroll-travel=""
				className={`absolute top-0 left-0 z-10 size-full *:size-full ${className}`}
			>
				{children}
			</div>
		</div>
	);
}