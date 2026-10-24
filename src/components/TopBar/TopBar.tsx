import type { ReactNode } from "react";

export interface TopBarProps {
	/** Page title, shown in the middle as the main heading (h1) */
	readonly title: string;
	/** Content on the left, e.g. a back button or a logo */
	readonly start?: ReactNode;
	/** Content on the right, e.g. a profile button and a hamburger button */
	readonly end?: ReactNode;
	/** Float at the top of the viewport (true) or sit in the normal page flow (false) */
	readonly fixed?: boolean;
	/** Extra classes, e.g. to change the width */
	readonly className?: string;
}

export function TopBar({
	title,
	start,
	end,
	fixed = true,
	className = "",
}: TopBarProps) {
	return (
		<header
			className={`z-90 grid h-[max(10dvh,60px)] grid-cols-[1fr_minmax(0,auto)_1fr] items-center gap-2 rounded-b-2xl bg-neutral-100 px-4 text-neutral-900 shadow-[0_0_33px_10px_rgba(0,0,0,0.2)] lg:px-8 dark:bg-neutral-800 dark:text-neutral-100 ${
				fixed
					? "fixed inset-x-0 top-0 mx-auto w-[90%] lg:w-[max(60%,260px)]"
					: "relative w-full"
			} ${className}`}
		>
			<div className="flex items-center justify-start gap-2">{start}</div>
			<h1 className="truncate text-center text-xl font-bold lg:text-2xl">
				{title}
			</h1>
			<div className="flex items-center justify-end gap-2">{end}</div>
		</header>
	);
}