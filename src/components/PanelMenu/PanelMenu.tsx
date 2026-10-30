"use client";

import {
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
	type CSSProperties,
	type ReactNode,
} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export interface PanelMenuLink {
	/** Text of the link */
	readonly label: string;
	/** Target of the link */
	readonly href: string;
}

export interface PanelMenuProps {
	/** Links in the top panel */
	readonly links: readonly PanelMenuLink[];
	/** Small line at the bottom of the top panel, e.g. a login link */
	readonly footer?: ReactNode;
	/** Content of the highlighted middle panel, e.g. a news item. The panel is left out when empty */
	readonly highlight?: ReactNode;
	/** Content of the dark bottom panel, e.g. social links. The panel is left out when empty */
	readonly bottom?: ReactNode;
	/** Accessible name of the navigation */
	readonly label?: string;
	/** Label of the toggle button while the menu is closed */
	readonly openLabel?: string;
	/** Label of the toggle button while the menu is open */
	readonly closeLabel?: string;
	/** Use a different ease when the opening animation is reversed (needs GSAP 3.15+), so the menu gets out of the way quickly */
	readonly easeReverse?: boolean;
	/** Speed of the reversed opening animation when the menu is closed before it finished opening (1 = normal) */
	readonly exitSpeed?: number;
	/** Main color of the highlight panel */
	readonly accentColor?: string;
	/** Light end of the highlight panel gradient */
	readonly accentColorLight?: string;
	/** Called when the menu opens or closes */
	readonly onOpenChange?: (open: boolean) => void;
	/** Extra classes for the toggle button, e.g. to move it */
	readonly className?: string;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function PanelMenuContent({
	links,
	footer,
	highlight,
	bottom,
	label = "Main navigation",
	openLabel = "Open menu",
	closeLabel = "Close menu",
	easeReverse = true,
	exitSpeed = 1.5,
	accentColor = "#0ae448",
	accentColorLight = "#abff84",
	onOpenChange,
	className = "",
}: PanelMenuProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const navRef = useRef<HTMLElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const timelineRef = useRef<gsap.core.Timeline | null>(null);
	const enterEndRef = useRef(0);
	const openRef = useRef(false);
	const exitSpeedRef = useRef(exitSpeed);
	const onOpenChangeRef = useRef(onOpenChange);
	const navId = useId();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		exitSpeedRef.current = exitSpeed;
		onOpenChangeRef.current = onOpenChange;
	});

	// One timeline for everything: the opening animation, a pause, then a
	// different closing animation (the panels fall down)
	useGSAP(
		() => {
			// With reduced motion the menu just appears and disappears
			if (window.matchMedia(REDUCED_MOTION).matches) return;

			const nav = navRef.current!; // always set once effects run
			const q = gsap.utils.selector(rootRef.current!);
			const er = (ease: string) => (easeReverse ? ease : false);

			const bg = q("[data-bg]");
			const panels = q("[data-panel]");
			const items = q("[data-item]");
			const login = q("[data-login]");
			const barTop = q("[data-bar-top]");
			const barMid = q("[data-bar-mid]");
			const barBot = q("[data-bar-bot]");

			gsap.set(nav, { visibility: "hidden" });
			gsap.set(bg, { opacity: 0 });
			gsap.set(login, { opacity: 0, y: 8 });

			const tl = gsap
				.timeline({ paused: true })
				.set(nav, { visibility: "visible", pointerEvents: "auto" })

				// ENTER
				.to(
					bg,
					{
						opacity: 1,
						duration: 0.4,
						ease: "power2.out",
						easeReverse: er("power4.out"),
					},
					0,
				)
				.fromTo(
					panels,
					{ x: "110%", y: 0, rotation: 0 },
					{
						x: "0%",
						y: 0,
						duration: 0.6,
						ease: "back.out",
						easeReverse: er("power3.in"),
						stagger: 0.1,
					},
					0,
				)
				.fromTo(
					items,
					{ opacity: 0, x: -20 },
					{
						opacity: 1,
						x: 0,
						duration: 1.2,
						ease: "expo.out",
						easeReverse: er("power3.in"),
						stagger: 0.03,
					},
					0.1,
				)
				.fromTo(
					barTop,
					{ attr: { x1: 3, y1: 7, x2: 17, y2: 7 } },
					{
						attr: { x1: 5, y1: 5, x2: 15, y2: 15 },
						duration: 0.35,
						ease: "back.out(1.4)",
						easeReverse: er("power3.out"),
					},
					0.06,
				)
				.fromTo(
					barBot,
					{ attr: { x1: 3, y1: 13, x2: 17, y2: 13 } },
					{
						attr: { x1: 15, y1: 5, x2: 5, y2: 15 },
						duration: 0.35,
						ease: "back.out(1.4)",
						easeReverse: er("power3.out"),
					},
					0.06,
				)
				.to(
					barMid,
					{ opacity: 0, duration: 0.2, ease: "power3.out" },
					0.06,
				)
				.to(
					login,
					{
						opacity: 1,
						y: 0,
						duration: 0.3,
						ease: "power3.out",
						easeReverse: er("power4.out"),
					},
					0.4,
				)

				// the menu waits here until it is closed
				.addPause();

			enterEndRef.current = tl.duration();

			// EXIT: X back to a hamburger, the panels fall down, bottom one first
			tl.to(barMid, { opacity: 1, duration: 0.2, ease: "power3.in" })
				.to(
					barTop,
					{
						attr: { x1: 3, y1: 7, x2: 17, y2: 7 },
						duration: 0.2,
						ease: "power3.in",
					},
					"<",
				)
				.to(
					barBot,
					{
						attr: { x1: 3, y1: 13, x2: 17, y2: 13 },
						duration: 0.2,
						ease: "power3.in",
					},
					"<",
				)
				.to(
					panels,
					{
						y: "110vh",
						rotation: "random(-25, 25)",
						duration: 1,
						ease: "power3.in",
						stagger: { from: "end", each: 0.02 },
					},
					"<",
				)
				.to(bg, { opacity: 0, duration: 0.3, ease: "power2.in" }, "<0.1")
				.set(nav, { visibility: "hidden", pointerEvents: "none" });

			timelineRef.current = tl;
			return () => {
				timelineRef.current = null;
			};
		},
		{ scope: rootRef, dependencies: [] },
	);

	const setMenu = useCallback((next: boolean) => {
		if (openRef.current === next) return;
		openRef.current = next;
		setOpen(next);
		onOpenChangeRef.current?.(next);

		const tl = timelineRef.current;
		if (next) {
			if (tl) {
				// after a finished exit, start over; otherwise continue where it stopped
				if (tl.time() >= enterEndRef.current) tl.timeScale(1).restart();
				else tl.timeScale(1).play();
			}
			return;
		}

		buttonRef.current!.focus();
		if (!tl) return;
		// closed while still opening: reverse it. Fully open: play the exit animation
		if (tl.time() < enterEndRef.current) {
			tl.timeScale(exitSpeedRef.current).reverse();
		} else {
			tl.timeScale(1).play();
		}
	}, []);

	// Esc closes the menu
	useEffect(() => {
		if (!open) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setMenu(false);
			if (event.key === "Tab") {
				const focusable = [
					buttonRef.current!,
					...navRef.current!.querySelectorAll<HTMLElement>(
						'a[href], button:not([tabindex="-1"]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
					),
				];
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				const active = document.activeElement;
				const inside = focusable.includes(active as HTMLElement);
				if (!inside) {
					event.preventDefault();
					(event.shiftKey ? last : first).focus();
				} else if (event.shiftKey && active === first) {
					event.preventDefault();
					last.focus();
				} else if (!event.shiftKey && active === last) {
					event.preventDefault();
					first.focus();
				}
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open, setMenu]);

	// Lock page scroll while open, then restore the previous value
	useEffect(() => {
		if (!open) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previous;
		};
	}, [open]);

	return (
		<div
			ref={rootRef}
			className="contents"
			style={
				{
					"--pm-accent": accentColor,
					"--pm-accent-light": accentColorLight,
				} as CSSProperties
			}
		>
			<button
				ref={buttonRef}
				type="button"
				aria-label={open ? closeLabel : openLabel}
				aria-expanded={open}
				aria-controls={navId}
				onClick={() => setMenu(!openRef.current)}
				className={`fixed top-5 right-6 z-310 flex size-11 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:transition-none ${
					open ? "text-[#0e100f]" : "text-neutral-900 dark:text-neutral-100"
				} ${className}`}
			>
				<svg
					viewBox="0 0 20 20"
					fill="none"
					aria-hidden="true"
					className="size-5"
				>
					<line
						data-bar-top
						x1="3"
						y1="7"
						x2="17"
						y2="7"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
					<line
						data-bar-mid
						x1="3"
						y1="10"
						x2="17"
						y2="10"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
					<line
						data-bar-bot
						x1="3"
						y1="13"
						x2="17"
						y2="13"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
				</svg>
			</button>

			<nav
				ref={navRef}
				id={navId}
				aria-label={label}
				inert={!open}
				className={`fixed inset-0 z-200 flex flex-col items-end gap-2 p-4 ${
					open
						? "pointer-events-auto visible"
						: "pointer-events-none invisible"
				}`}
			>
				<button
					data-bg
					type="button"
					tabIndex={-1}
					aria-hidden="true"
					onClick={() => setMenu(false)}
					className={`absolute inset-0 cursor-default border-none bg-black/40 p-0 ${
						open ? "opacity-100" : "opacity-0"
					}`}
				/>

				<div
					data-panel
					className="relative z-3 flex min-h-0 w-full max-w-[700px] flex-1 flex-col overflow-y-auto rounded-[10px] border-2 border-[#0e100f] bg-[#fffce1] px-7 pt-[50px] pb-7 text-[#0e100f] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
				>
					<ul className="flex flex-1 flex-col justify-center">
						{links.map((link) => (
							<li key={`${link.href}-${link.label}`} data-item className="overflow-hidden">
								<a
									href={link.href}
									onClick={() => setMenu(false)}
									className="block py-2.5 text-[clamp(1.5rem,4vw,1.8rem)] leading-[1.1] font-semibold tracking-[-0.03em] hover:underline focus-visible:underline"
								>
									{link.label}
								</a>
							</li>
						))}
					</ul>
					{footer && (
						<div
							data-login
							className="mt-auto pt-5 font-mono text-[0.82rem] text-neutral-600"
						>
							{footer}
						</div>
					)}
				</div>

				{highlight && (
					<div
						data-panel
						className="relative z-2 flex min-h-45 w-full max-w-175 flex-col justify-center rounded-[10px] border-2 border-black/50 bg-linear-135 from-(--pm-accent) via-(--pm-accent-light) via-40% to-(--pm-accent) px-7 py-6 text-[#0e100f]"
					>
						{highlight}
					</div>
				)}

				{bottom && (
					<div
						data-panel
						className="relative z-1 flex min-h-30 w-full max-w-175 items-center rounded-[10px] border-2 border-[#42433d] bg-[#0e100f] px-7 py-6 text-[#bbbaa6]"
					>
						{bottom}
					</div>
				)}
			</nav>
		</div>
	);
}

export function PanelMenu(props: PanelMenuProps) {
	// Changing easeReverse rebuilds the timeline: remount so the menu starts closed
	return <PanelMenuContent key={String(props.easeReverse ?? true)} {...props} />;
}