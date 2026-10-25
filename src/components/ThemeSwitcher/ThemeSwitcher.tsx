"use client";

import { useEffect, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { Moon, Sun } from "lucide-react";

export interface ThemeSwitcherProps {
	/** Accessible label of the button */
	readonly label?: string;
	/** localStorage key that stores the choice ("dark" or "light") */
	readonly storageKey?: string;
	/** Class toggled on the `<html>` element in dark mode (must match your Tailwind dark variant) */
    readonly darkClass?: string;
	/** Accent color (dark track and icon) */
	readonly accentColor?: string;
	/** Extra classes for the button, e.g. margins */
	readonly className?: string;
}

function subscribe(callback: () => void) {
	const observer = new MutationObserver(callback);
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});
	return () => observer.disconnect();
}

export function ThemeSwitcher({
	label = "Toggle theme (dark/light)",
	storageKey = "theme",
	darkClass = "dark",
	accentColor = "#2563eb",
	className = "",
}: ThemeSwitcherProps) {
	const isDark = useSyncExternalStore(
		subscribe,
		() => document.documentElement.classList.contains(darkClass),
		() => false, // server snapshot
	);

    const appliedClass = useRef(darkClass);

    // Apply a previously stored choice on mount, and move the theme to the new class when darkClass changes
    useEffect(() => {
        const root = document.documentElement;
        const previous = appliedClass.current;
        const wasDark = previous !== darkClass && root.classList.contains(previous);

        if (previous !== darkClass) {
            root.classList.remove(previous);
            appliedClass.current = darkClass;
        }

        let stored: string | null = null;
        try {
            stored = localStorage.getItem(storageKey);
        } catch {
            // storage unavailable (e.g. private mode): keep the current theme
        }

        if (stored) root.classList.toggle(darkClass, stored === "dark");
        else if (wasDark) root.classList.add(darkClass);
    }, [storageKey, darkClass]);

	// Apply a previously stored choice once on mount
	useEffect(() => {
		try {
			const stored = localStorage.getItem(storageKey);
			if (stored) {
				document.documentElement.classList.toggle(darkClass, stored === "dark");
			}
		} catch {
			// storage unavailable (e.g. private mode): keep the current theme
		}
	}, [storageKey, darkClass]);

	const toggle = () => {
		const next = !isDark;
		document.documentElement.classList.toggle(darkClass, next);
		try {
			localStorage.setItem(storageKey, next ? "dark" : "light");
		} catch {
			// storage unavailable: the theme still changes for this visit
		}
	};

    return (
        <button
            type="button"
            aria-label={label}
            aria-pressed={isDark}
            onClick={toggle}
            style={{ "--theme-accent": accentColor } as CSSProperties}
            className={`relative flex h-[clamp(1.2rem,2vw,1.8rem)] w-[clamp(2.5rem,4vw,3.5rem)] cursor-pointer items-center justify-start rounded-full border-none shadow-[inset_0_2px_2px_-2px_rgba(50,50,93,0.25),inset_0_2px_2px_-2px_rgba(0,0,0,0.3)] transition-all duration-200 ease-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--theme-accent) motion-reduce:transition-none ${
                isDark ? "bg-(--theme-accent)" : "bg-neutral-300"
            } ${className}`}
        >
            <span
                className={`relative flex aspect-square h-4/5 shrink-0 items-center justify-center rounded-full bg-white p-[0.2rem] text-(--theme-accent) transition-[left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
                    isDark
                        ? "left-[calc(100%_-_clamp(1rem,1.5vw,1.5rem)_-_clamp(2px,0.4vw,4px))]"
                        : "left-[5%]"
                }`}
            >
                {isDark ? (
                    <Sun className="size-full" aria-hidden="true" />
                ) : (
                    <Moon className="size-full" aria-hidden="true" />
                )}
            </span>
        </button>
    );
}