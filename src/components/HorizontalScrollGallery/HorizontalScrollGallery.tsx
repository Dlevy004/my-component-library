"use client";

import { useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export interface HorizontalGalleryImage {
	/** Image URL */
	readonly src: string;
	/** Alternative text. Leave empty for purely decorative images */
	readonly alt?: string;
}

export interface HorizontalScrollGalleryProps {
	/** Images, shown as square tiles in a row */
	readonly images: readonly HorizontalGalleryImage[];
	/** Width of one image (without its 2rem padding) as a CSS length. `cqw` is a percent of the gallery's own width. The default fills the width on narrow screens (one image at a time, at most 24rem) and is a third of the width on wide ones */
    readonly itemWidth?: string;
	/** Seconds the strip takes to catch up with the scroll position. Higher is smoother but lags more, 0 follows the scroll exactly */
	readonly smoothing?: number;
	/** Scrollable element to watch instead of the page, e.g. a panel with overflow-y: auto */
	readonly scrollContainer?: HTMLElement | null;
	/** Accessible name of the gallery */
	readonly label?: string;
	/** Extra classes for the gallery */
	readonly className?: string;
}

export function HorizontalScrollGallery({
	images,
	itemWidth = "max(33cqw, min(100cqw - 4rem, 24rem))",
	smoothing = 2,
	scrollContainer,
	label = "Image gallery",
	className = "",
}: HorizontalScrollGalleryProps) {
	const outerRef = useRef<HTMLDivElement>(null);
	const stickyRef = useRef<HTMLDivElement>(null);
	const stripRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			// Visitors who prefer reduced motion get a plain, swipeable row
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

			const outer = outerRef.current!; // always set once effects run
			const sticky = stickyRef.current!;
			const strip = stripRef.current!;
			const travel = () => Math.max(0, strip.scrollWidth - sticky.clientWidth);

			// The outer box is as tall as the sticky row plus the distance to scroll.
			// The row stays in place (position: sticky) while the strip slides sideways.
			const sizeOuter = () => {
				outer.style.height = `${sticky.offsetHeight + strip.scrollWidth}px`;
			};
			sizeOuter();

			gsap.to(strip, {
				x: () => -travel(),
				ease: "none",
				scrollTrigger: {
					trigger: sticky,
					scroller: scrollContainer ?? undefined,
					scrub: smoothing > 0 ? smoothing : true,
					start: "center center",
					end: () => `+=${strip.scrollWidth}`,
					invalidateOnRefresh: true,
					onRefreshInit: sizeOuter,
				},
			});

			return () => {
				outer.style.height = "";
			};
		},
		{
			scope: outerRef,
			dependencies: [scrollContainer, images.length, itemWidth, smoothing],
			revertOnUpdate: true,
		},
	);

	return (
		<div
			ref={outerRef}
			role="group"
			aria-label={label}
			style={{ "--hg-item": itemWidth } as CSSProperties}
			className={`relative w-full @container ${className}`}
		>
			<div
				ref={stickyRef}
				className="sticky top-[calc(50%-(var(--hg-item)+4rem)/2)] overflow-hidden motion-reduce:overflow-x-auto"
			>
				<div ref={stripRef} className="flex w-max flex-nowrap will-change-transform">
					{images.map((image, index) => (
						<div
							key={`${image.src}-${index}`}
							className="box-content w-(--hg-item) shrink-0 p-8"
						>
							<img
								src={image.src}
								alt={image.alt ?? ""}
								className="aspect-square w-full object-cover"
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}