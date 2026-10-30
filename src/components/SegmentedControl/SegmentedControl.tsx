"use client";

import { useId, type CSSProperties, type KeyboardEvent } from "react";

export interface SegmentedControlOption {
	/** Value passed to onChange when the option is chosen */
	readonly value: string;
	/** Text of the option */
	readonly label: string;
}

export interface SegmentedControlProps {
	/** Visible label above the control, also its accessible name */
	readonly label: string;
	/** The choices, in order */
	readonly options: readonly SegmentedControlOption[];
	/** Value of the selected option. If no option matches, nothing is highlighted */
	readonly value: string;
	/** Called with the new value when the user picks a different option */
	readonly onChange: (value: string) => void;
	/** Accent color of the highlight. The selected text is white, so pick a color with at least 4.5:1 contrast against white */
	readonly accentColor?: string;
	/** Accent color of the highlight in dark mode. The selected text is dark, so pick a light color */
	readonly accentColorDark?: string;
	/** Extra classes, e.g. to limit the width */
	readonly className?: string;
}

export function SegmentedControl({
	label,
	options,
	value,
	onChange,
	accentColor = "#2563eb",
	accentColorDark = "#60a5fa",
	className = "",
}: SegmentedControlProps) {
	const labelId = useId();
	const selectedIndex = options.findIndex((option) => option.value === value);
	// the selected option is the one Tab stop, or the first one if nothing is selected
	const tabStop = selectedIndex >= 0 ? selectedIndex : 0;

	const choose = (index: number) => {
		const next = options[index].value;
		if (next !== value) onChange(next);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
		const count = options.length;
		const targets: Record<string, number> = {
			ArrowRight: (index + 1) % count,
			ArrowDown: (index + 1) % count,
			ArrowLeft: (index - 1 + count) % count,
			ArrowUp: (index - 1 + count) % count,
			Home: 0,
			End: count - 1,
		};
		const target = targets[event.key];
		if (target === undefined) return;

		event.preventDefault();
		choose(target);
		// move the focus along with the selection
		event.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>(
			'[role="radio"]',
		)[target].focus();
	};

	return (
		<div className={`flex w-full flex-col gap-1.5 ${className}`}>
			<p id={labelId}>{label}</p>
			<div
				role="radiogroup"
				aria-labelledby={labelId}
				style={
					{
						"--seg-count": options.length,
						"--seg-accent": accentColor,
						"--seg-accent-dark": accentColorDark,
					} as CSSProperties
				}
				className="relative flex h-[42px] items-center rounded-[11px] bg-neutral-200 p-1 shadow-[inset_0_0_10px_0_rgba(0,0,0,0.15)] dark:bg-neutral-800"
			>
				{selectedIndex >= 0 && (
					<span
						data-indicator=""
						aria-hidden="true"
						style={{ "--seg-index": selectedIndex } as CSSProperties}
						className="absolute top-1 left-1 h-[calc(100%-8px)] w-[calc((100%-8px)/var(--seg-count))] translate-x-[calc(var(--seg-index)*100%)] rounded-lg bg-(--seg-accent) transition-[translate] duration-300 ease-in-out motion-reduce:transition-none dark:bg-(--seg-accent-dark)"
					/>
				)}
				{options.map((option, index) => {
					const checked = index === selectedIndex;

					return (
						<button
							key={option.value}
							type="button"
							role="radio"
							aria-checked={checked}
							tabIndex={index === tabStop ? 0 : -1}
							onClick={() => choose(index)}
							onKeyDown={(event) => handleKeyDown(event, index)}
							className={`relative z-10 h-full flex-1 cursor-pointer rounded-lg border-none bg-transparent font-bold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--seg-accent) motion-reduce:transition-none dark:focus-visible:outline-(--seg-accent-dark) ${
								checked
									? "text-white dark:text-neutral-900"
									: "text-neutral-900 dark:text-neutral-100"
							}`}
						>
							{option.label}
						</button>
					);
				})}
			</div>
		</div>
	);
}