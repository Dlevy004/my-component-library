"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip);

export interface BentoGalleryImage {
	/** Image URL */
	readonly src: string;
	/** Alternative text. Leave empty for purely decorative images */
	readonly alt?: string;
}

export interface ScrollBentoGalleryProps {
	/** Up to 8 images, placed in the bento layout in order. Extra images are ignored */
	readonly images: readonly BentoGalleryImage[];
	/** Height of the gallery area as a CSS length. The grid is sized to this box */
	readonly height?: string;
	/** How far the visitor scrolls during the animation, as a ScrollTrigger end value, e.g. "+=100%" (one box height) or "+=1500" (pixels) */
	readonly scrollDistance?: string;
	/** Scrollable element to watch instead of the page, e.g. a panel with overflow-y: auto */
	readonly scrollContainer?: HTMLElement | null;
	/** Accessible name of the gallery */
	readonly label?: string;
	/** Extra classes for the gallery area */
	readonly className?: string;
}

// Grid area of each tile: row start / column start / row end / column end
const AREAS = [
	"[grid-area:1/1/3/2]",
	"[grid-area:1/2/2/3]",
	"[grid-area:2/2/4/3]",
	"[grid-area:1/3/3/3]",
	"[grid-area:3/1/3/2]",
	"[grid-area:3/3/5/4]",
	"[grid-area:4/1/5/2]",
	"[grid-area:4/2/5/3]",
] as const;

export function ScrollBentoGallery({
	images,
	height = "100vh",
	scrollDistance = "+=100%",
	scrollContainer,
	label = "Image gallery",
	className = "",
}: ScrollBentoGalleryProps) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const galleryRef = useRef<HTMLDivElement>(null);
	const [layoutKey, setLayoutKey] = useState(0);

	// The final layout depends on the size of the box, so rebuild after a resize
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

	useGSAP(
		() => {
			const wrap = wrapRef.current!; // always set once effects run
			const gallery = galleryRef.current!;

			// Visitors who prefer reduced motion get the static bento grid
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

			const items = Array.from(gallery.children);

			// Record the final (full-box) layout, then go back to the bento layout
			gallery.toggleAttribute("data-final", true);
			const state = Flip.getState(items);
			gallery.toggleAttribute("data-final", false);

			const flip = Flip.to(state, { simple: true, ease: "expoScale(1, 5)" });

			gsap
				.timeline({
					scrollTrigger: {
						trigger: gallery,
						scroller: scrollContainer ?? undefined,
						start: "center center",
						end: scrollDistance,
						scrub: true,
						pin: wrap,
					},
				})
				.add(flip);

			return () => {
				gsap.set(items, { clearProps: "all" });
			};
		},
		{
			scope: wrapRef,
			dependencies: [layoutKey, scrollDistance, scrollContainer, images.length],
			revertOnUpdate: true,
		},
	);

	return (
		<div
			ref={wrapRef}
			role="group"
			aria-label={label}
			style={{ "--bento-height": height } as CSSProperties}
			className={`relative flex h-(--bento-height) w-full items-center justify-center overflow-hidden @container-size ${className}`}
		>
			<div
				ref={galleryRef}
				className="relative grid h-full w-full flex-none grid-cols-[repeat(3,32.5cqw)] grid-rows-[repeat(4,23cqh)] content-center justify-center gap-[1cqh] data-final:grid-cols-[repeat(3,100cqw)] data-final:grid-rows-[repeat(4,49.5cqh)]"
			>
				{images.slice(0, AREAS.length).map((image, index) => (
					<div
						key={`${image.src}-${index}`}
						className={`relative flex-none ${AREAS[index]}`}
					>
						<img
							src={image.src}
							alt={image.alt ?? ""}
							className="size-full object-cover"
						/>
					</div>
				))}
			</div>
		</div>
	);
}