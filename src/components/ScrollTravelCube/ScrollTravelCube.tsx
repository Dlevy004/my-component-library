"use client";

import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type CSSProperties,
} from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
	BoxGeometry,
	CanvasTexture,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	SRGBColorSpace,
	WebGLRenderer,
} from "three";

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip);

/** A stop is an element or a CSS selector. Empty values are skipped */
export type ScrollTravelStop = HTMLElement | string | null | undefined;

export interface ScrollTravelCubeProps {
	/** Places to fly to, in order. The canvas is resized and moved onto each stop's box */
	readonly targets: readonly ScrollTravelStop[];
	/** Width and height of the cube where it starts, as a CSS length */
	readonly size?: string;
	/** Half turns the cube makes on both axes between two stops (1 = 180 degrees) */
	readonly spin?: number;
	/** First color of the cube's gradient texture */
	readonly colorA?: string;
	/** Second color of the cube's gradient texture */
	readonly colorB?: string;
	/** Pause between two stops, relative to one flight (0.5 = half as long as a flight) */
	readonly hold?: number;
	/** Seconds the cube takes to catch up with the scroll position. 0 follows the scroll exactly */
	readonly smoothing?: number;
	/** ScrollTrigger start: when the cube's starting place reaches the middle of the screen */
	readonly start?: string;
	/** ScrollTrigger end, measured on `endTrigger` */
	readonly end?: string;
	/** Element that marks the end of the journey. Defaults to the last stop */
	readonly endTrigger?: HTMLElement | string | null;
	/** Scrollable element to watch instead of the page, e.g. a panel with overflow-y: auto */
	readonly scrollContainer?: HTMLElement | null;
	/** Accessible description of the cube */
	readonly label?: string;
	/** Extra classes for the traveling box */
	readonly className?: string;
}

interface ThreeState {
	readonly mesh: Mesh;
	readonly texture: CanvasTexture;
	readonly paintCanvas: HTMLCanvasElement;
	/** True when the scene changed and needs to be drawn again */
	dirty: boolean;
}

const resolve = (stop: ScrollTravelStop) =>
	typeof stop === "string"
		? document.querySelector<HTMLElement>(stop)
		: (stop ?? null);

// Paints the cube's texture: a diagonal gradient with a subtle grain
function paintTexture(canvas: HTMLCanvasElement, colorA: string, colorB: string) {
	const g = canvas.getContext("2d")!; // 2D canvases are always available
	const gradient = g.createLinearGradient(0, 0, 230, 384);
	gradient.addColorStop(0, colorA);
	gradient.addColorStop(1, colorB);
	g.fillStyle = gradient;
	g.fillRect(0, 0, 256, 256);

	for (let i = 0; i < 4000; i++) {
		g.fillStyle = `rgba(0,0,0,${0.02 + Math.random() * 0.08})`;
		g.fillRect(
			Math.floor(Math.random() * 256),
			Math.floor(Math.random() * 256),
			3,
			3,
		);
	}
}

export function ScrollTravelCube({
	targets,
	size = "160px",
	spin = 1,
	colorA = "#fec5fb",
	colorB = "#00bae2",
	hold = 0.5,
	smoothing = 1,
	start = "clamp(top center)",
	end = "clamp(top center)",
	endTrigger,
	scrollContainer,
	label = "Rotating cube",
	className = "",
}: ScrollTravelCubeProps) {
	const anchorRef = useRef<HTMLDivElement>(null);
	const travelerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const threeRef = useRef<ThreeState | null>(null);
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

	// The 3D scene is created once. It must exist before the timeline below is
	// built, so it is declared first (layout effects run in declaration order).
	useLayoutEffect(() => {
		const canvas = canvasRef.current!; // always set once effects run

		let renderer: WebGLRenderer;
		try {
			renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
		} catch {
			return; // no WebGL: leave the canvas empty
		}
		renderer.outputColorSpace = SRGBColorSpace;

		const paintCanvas = document.createElement("canvas");
		paintCanvas.width = paintCanvas.height = 256;
		const texture = new CanvasTexture(paintCanvas);
		texture.colorSpace = SRGBColorSpace;
		texture.anisotropy = 4;

		const camera = new PerspectiveCamera(45, 1, 0.1, 100);
		camera.position.set(0, 0, 3);

		const geometry = new BoxGeometry(1, 1, 1);
		const material = new MeshBasicMaterial({ map: texture });
		const mesh = new Mesh(geometry, material);
		const scene = new Scene();
		scene.add(mesh);

		const three: ThreeState = { mesh, texture, paintCanvas, dirty: true };
		threeRef.current = three;

		// The canvas changes size while it flies, so keep the drawing buffer in sync
		const resizeObserver = new ResizeObserver(([entry]) => {
			const width = Math.max(1, entry.contentRect.width);
			const height = Math.max(1, entry.contentRect.height);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			renderer.setSize(width, height, false);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			three.dirty = true;
		});
		resizeObserver.observe(canvas);

		// Draw on GSAP's ticker, and only when something changed
		const tick = () => {
			if (!three.dirty) return;
			three.dirty = false;
			renderer.render(scene, camera);
		};
		gsap.ticker.add(tick);

		return () => {
			gsap.ticker.remove(tick);
			resizeObserver.disconnect();
			threeRef.current = null;
			geometry.dispose();
			material.dispose();
			texture.dispose();
			renderer.dispose();
		};
	}, []);

	// Repaint the texture when the colors change (also paints it the first time)
	useLayoutEffect(() => {
		const three = threeRef.current;
		if (!three) return;
		paintTexture(three.paintCanvas, colorA, colorB);
		three.texture.needsUpdate = true;
		three.dirty = true;
	}, [colorA, colorB]);

	// Stops that arrive later (e.g. elements stored in state) rebuild the animation
	const stopCount = targets.filter(Boolean).length;

	useGSAP(
		() => {
			const three = threeRef.current;
			if (!three) return;

			// Visitors who prefer reduced motion get a still cube
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

			const anchor = anchorRef.current!;
			const traveler = travelerRef.current!;
			const stops = targets
				.map(resolve)
				.filter((stop): stop is HTMLElement => stop !== null);
			if (stops.length === 0) return;

			const timeline = gsap.timeline({
				onUpdate: () => {
					three.dirty = true;
				},
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

				timeline
					.add(flight, index === 0 ? 0 : `+=${hold}`)
					.to(
						three.mesh.rotation,
						{
							x: `+=${Math.PI * spin}`,
							y: `+=${Math.PI * spin}`,
							duration: 1,
							ease: "none",
						},
						"<",
					);
			});
		},
		{
			dependencies: [
				layoutKey,
				stopCount,
                targets,
				scrollContainer,
				endTrigger,
				start,
				end,
				hold,
				smoothing,
				spin,
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
				data-scroll-travel-cube=""
				className={`absolute top-0 left-0 z-10 size-full ${className}`}
			>
				<canvas
					ref={canvasRef}
					role="img"
					aria-label={label}
					className="block size-full"
				/>
			</div>
		</div>
	);
}