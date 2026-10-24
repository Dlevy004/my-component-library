"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { X } from "lucide-react";

const SLIDE_MS = 300;

export interface DrawerProps {
	/** Whether the drawer is open */
	readonly open: boolean;
	/** Called when the user asks to close it (close button, Esc key, click on the backdrop). Set `open` to false in response */
	readonly onClose: () => void;
	/** Content of the drawer, e.g. navigation links */
	readonly children: ReactNode;
	/** Accessible name of the drawer */
	readonly label?: string;
	/** Label of the close button */
	readonly closeLabel?: string;
	/** Which edge the drawer slides in from */
	readonly side?: "left" | "right";
	/** Id of the drawer, so a button can point to it with aria-controls */
	readonly id?: string;
	/** Accent color of the close button */
	readonly accentColor?: string;
	/** Accent color of the close button in dark mode */
	readonly accentColorDark?: string;
	/** Extra classes for the panel, e.g. to change the width */
	readonly className?: string;
}

export function Drawer({
	open,
	onClose,
	children,
	label = "Menu",
	closeLabel = "Close menu",
	side = "right",
	id,
	accentColor = "black",
	accentColorDark = "white",
	className = "",
}: DrawerProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	// Open and close the native dialog, with a slide animation
	useEffect(() => {
		const dialog = dialogRef.current!;

		if (open) {
			if (!dialog.open) dialog.showModal();
			void dialog.offsetWidth;
			dialog.dataset.shown = "";
			return;
		}

		if (!dialog.open) return;
		delete dialog.dataset.shown;
		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const timer = setTimeout(() => dialog.close(), reduceMotion ? 0 : SLIDE_MS);
		return () => clearTimeout(timer);
	}, [open]);

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
		<dialog
			ref={dialogRef}
			id={id}
			aria-label={label}
			// Esc: keep the dialog open and let the parent close it (so the slide-out runs)
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
			// A click on the backdrop lands on the dialog element itself
			onClick={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
			style={
				{
					"--drawer-accent": accentColor,
					"--drawer-accent-dark": accentColorDark,
				} as CSSProperties
			}
			className={`fixed inset-y-0 m-0 h-dvh max-h-none w-[min(75%,350px)] max-w-none overflow-hidden border-none bg-neutral-100 p-0 text-neutral-900 shadow-[-5px_0_20px_rgba(0,0,0,0.1)] transition-[translate] duration-300 ease-out backdrop:bg-black/40 motion-reduce:transition-none data-shown:translate-x-0 dark:bg-neutral-900 dark:text-neutral-100 ${
				side === "right"
					? "right-0 left-auto translate-x-full"
					: "right-auto left-0 -translate-x-full"
			} ${className}`}
		>
			<button
				type="button"
				aria-label={closeLabel}
				onClick={onClose}
				className="absolute top-4 right-4 z-10 size-8 cursor-pointer rounded-full border-none bg-transparent p-0 text-(--drawer-accent) transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--drawer-accent) motion-reduce:transition-none dark:text-(--drawer-accent-dark) dark:focus-visible:outline-(--drawer-accent-dark)"
			>
				<X aria-hidden="true" className="size-full" />
			</button>
			<div className="flex h-full flex-col overflow-y-auto overscroll-contain px-6 pt-20 pb-8">
				{children}
			</div>
		</dialog>
	);
}