import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Canvas,
	Controls,
	Description,
	Heading,
	Source,
	Stories,
	Title,
} from "@storybook/addon-docs/blocks";
import gsap from "gsap";
import { expect, fn, waitFor } from "storybook/test";
import { PanelMenu } from "./PanelMenu";
import componentSource from "./PanelMenu.tsx?raw";

const description = [
	"A full-screen menu for the toggle button in the top right corner. The links, a highlight card and a dark footer panel slide in one after another, and when the menu is closed the panels fall away with a random tilt. <br> Built with **[GSAP](https://demos.gsap.com/demo/interruptible-single-timeline-enterexit/)**. Adapted from the GSAP CodePen demo \"Interruptible Single Timeline Enter/Exit\".",
	"",
	"**Requirements**",
	"- React 18+, `pnpm add gsap @gsap/react` (GSAP 3.15 or newer for `easeReverse`), Tailwind CSS v4 with a class-based dark variant (`@custom-variant dark (&:where(.dark, .dark *));`)",
	"",
	"**Good to know**",
	"- The toggle button is fixed to the top right corner, above the panels. Move it with `className`. Closed, its icon is dark in light mode and light in dark mode. Open, it is always dark, because it sits on the light top panel.",
	"- One interruptible GSAP timeline drives everything. If the menu is closed while it is still opening, the opening animation plays backwards (at `exitSpeed`). Once it is fully open, closing plays a separate exit animation.",
	"- `easeReverse` uses a faster ease for the backwards opening animation, so the menu gets out of the way quickly. Changing it rebuilds the menu, which then starts closed.",
	"- The menu closes with the toggle button, Esc, a click on the backdrop and a click on any link. While it is open the page cannot scroll, and in these examples that includes this docs page.",
	"- Panels without content (`highlight`, `bottom`) are left out. The panel colors are fixed. `accentColor` and `accentColorLight` only change the highlight panel, and its text is dark, so keep both colors light enough.",
	"- With reduced motion enabled, the menu opens and closes without animation.",
	"- Place it at the top level of the page. A parent with a `transform` or its own stacking context would trap the full-screen overlay."
].join("\n");

const usageSnippet = `import { PanelMenu } from "./components/PanelMenu/PanelMenu";

<PanelMenu
	links={[
		{ label: "Tools", href: "/tools" },
		{ label: "About", href: "/about" },
	]}
	footer={<a href="/login">Login / Create account</a>}
	highlight={
		<div>
			<p>Version 2 is here</p>
			<a href="/news">Release notes</a>
		</div>
	}
	bottom={<a href="https://github.com">GitHub</a>}
/>`;

function DocsPage() {
	return (
		<>
			<Title />
			<Description />
			<Canvas
				of={Default}
				source={{ code: componentSource, language: "tsx" }}
			/>
			<Heading>Usage</Heading>
			<Source of={Default} />
			<Controls />
			<Stories includePrimary={false} />
		</>
	);
}

const links = [
	{ label: "Tools", href: "#tools" },
	{ label: "About", href: "#about" },
	{ label: "Showcase", href: "#showcase" },
	{ label: "Community", href: "#community" },
	{ label: "Learn", href: "#learn" },
	{ label: "Docs", href: "#docs" },
];

const footer = <a href="#login">Login / Create account</a>;

const highlight = (
	<div className="flex flex-col gap-3.5">
		<p className="font-mono text-[0.65rem] tracking-widest uppercase opacity-70">
			What&apos;s new
		</p>
		<div>
			<p className="text-xl leading-tight font-semibold tracking-tight">
				Version 2 is here
			</p>
			<p className="text-sm opacity-70">A new menu and more.</p>
		</div>
		<a
			href="#notes"
			className="w-fit rounded-full bg-[#0e100f] px-3.5 py-1.5 font-mono text-xs text-[#abff84]"
		>
			Release notes
		</a>
	</div>
);

const bottom = (
	<ul className="flex flex-wrap gap-4 font-mono text-sm">
		{["CodePen", "GitHub", "LinkedIn", "X"].map((name) => (
			<li key={name}>
				<a href={`#${name.toLowerCase()}`} className="hover:text-white focus-visible:underline">
					{name}
				</a>
			</li>
		))}
	</ul>
);

const highlightHu = (
	<div className="flex flex-col gap-3.5">
		<p className="font-mono text-[0.65rem] tracking-widest uppercase opacity-70">
			Újdonság
		</p>
		<div>
			<p className="text-xl leading-tight font-semibold tracking-tight">
				Megérkezett a 2-es verzió
			</p>
			<p className="text-sm opacity-70">Új menü és még sok minden más.</p>
		</div>
		<a
			href="#notes"
			className="w-fit rounded-full bg-[#0e100f] px-3.5 py-1.5 font-mono text-xs text-[#abff84]"
		>
			Kiadási jegyzet
		</a>
	</div>
);

// Makes every animation 10x faster, so tests do not wait for them
const speedUp = () => {
	gsap.globalTimeline.timeScale(10);
	return () => {
		gsap.globalTimeline.timeScale(1);
	};
};

const mockReducedMotion = () => {
	const original = window.matchMedia;
	window.matchMedia = ((query: string) =>
		({
			matches: query.includes("prefers-reduced-motion"),
			media: query,
		}) as MediaQueryList) as typeof window.matchMedia;
	return () => {
		window.matchMedia = original;
	};
};

const isShown = (nav: HTMLElement) =>
	getComputedStyle(nav).visibility === "visible";

// the items animate to full opacity at the very end of the opening animation
const isFullyOpen = (nav: HTMLElement) =>
	getComputedStyle(nav.querySelector("[data-item]:last-child")!).opacity === "1";

const meta = {
	title: "Components/Navigation/PanelMenu",
	component: PanelMenu,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: DocsPage,
			description: { component: description },
		},
	},
	decorators: [
		(Story, { viewMode }) => {
			const page = (
				<main className="p-6 pt-24 text-neutral-600 dark:text-neutral-400">
					Page content
				</main>
			);

			// In the docs, a transformed box keeps the fixed overlay inside the example
			return viewMode === "docs" ? (
				<div
					className="relative h-160 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800"
					style={{ transform: "translateZ(0)" }}
				>
					<Story />
					{page}
				</div>
			) : (
				<>
					<Story />
					{page}
				</>
			);
		},
	],
	args: { links, footer, highlight, bottom, onOpenChange: fn() },
	argTypes: {
		links: { control: "object" },
		footer: { control: false },
		highlight: { control: false },
		bottom: { control: false },
		accentColor: { control: "color" },
		accentColorLight: { control: "color" },
		exitSpeed: { control: { type: "range", min: 1, max: 4, step: 0.5 } },
	},
	beforeEach: () => {
		document.body.style.overflow = "";
	},
} satisfies Meta<typeof PanelMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: { source: { type: "code", language: "tsx", code: usageSnippet } },
	},
};

export const Localized: Story = {
	args: {
		label: "Főmenü",
		openLabel: "Menü megnyitása",
		closeLabel: "Menü bezárása",
		links: [
			{ label: "Eszközök", href: "#tools" },
			{ label: "Rólunk", href: "#about" },
			{ label: "Referenciák", href: "#showcase" },
			{ label: "Közösség", href: "#community" },
			{ label: "Tanulás", href: "#learn" },
			{ label: "Dokumentáció", href: "#docs" },
		],
		footer: <a href="#login">Belépés / Regisztráció</a>,
		highlight: highlightHu,
	},
};

export const LinksOnly: Story = {
	args: {
		footer: undefined,
		highlight: undefined,
		bottom: undefined,
		onOpenChange: undefined,
	},
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(
			await canvas.findByRole("button", { name: "Open menu" }),
		);
		await expect(
			await canvas.findByRole("button", { name: "Close menu" }),
		).toHaveAttribute("aria-expanded", "true");
		await expect(canvasElement.querySelectorAll("[data-panel]")).toHaveLength(1);
	},
};

export const WithoutEaseReverse: Story = {
	args: { easeReverse: false },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(
			await canvas.findByRole("button", { name: "Open menu" }),
		);
		await expect(
			await canvas.findByRole("button", { name: "Close menu" }),
		).toHaveAttribute("aria-expanded", "true");
	},
};

export const OpensAndCloses: Story = {
	tags: ["!dev", "!autodocs"],
	beforeEach: speedUp,
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const nav = canvasElement.querySelector("nav")!;
		await expect(nav).toHaveAttribute("inert");
		await expect(getComputedStyle(nav).visibility).toBe("hidden");

		await userEvent.click(
			await canvas.findByRole("button", { name: "Open menu" }),
		);
		const toggle = await canvas.findByRole("button", { name: "Close menu" });
		await expect(toggle).toHaveAttribute("aria-expanded", "true");
		await expect(nav).not.toHaveAttribute("inert");
		await expect(document.body.style.overflow).toBe("hidden");
		await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
		await waitFor(() => expect(isFullyOpen(nav)).toBe(true));

		await userEvent.click(toggle);
		await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
		await waitFor(() => expect(isShown(nav)).toBe(false), { timeout: 3000 });
		await expect(document.body.style.overflow).toBe("");

		// opening again starts the whole animation over
		await userEvent.click(canvas.getByRole("button", { name: "Open menu" }));
		await waitFor(() => expect(isFullyOpen(nav)).toBe(true), { timeout: 3000 });
		await expect(isShown(nav)).toBe(true);
	},
};

export const ClosesOnEscape: Story = {
	tags: ["!dev", "!autodocs"],
	beforeEach: speedUp,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const nav = canvasElement.querySelector("nav")!;
		await userEvent.click(
			await canvas.findByRole("button", { name: "Open menu" }),
		);
		const toggle = await canvas.findByRole("button", { name: "Close menu" });
		await waitFor(() => expect(isFullyOpen(nav)).toBe(true));

		await userEvent.keyboard("a"); // other keys do nothing
		await expect(toggle).toHaveAttribute("aria-expanded", "true");

		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(toggle).toHaveAttribute("aria-expanded", "false"));
		await expect(toggle).toHaveFocus();
	},
};

export const ClosesOnBackdropClick: Story = {
	tags: ["!dev", "!autodocs"],
	beforeEach: speedUp,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const nav = canvasElement.querySelector("nav")!;
		await userEvent.click(
			await canvas.findByRole("button", { name: "Open menu" }),
		);
		const toggle = await canvas.findByRole("button", { name: "Close menu" });
		await waitFor(() => expect(isFullyOpen(nav)).toBe(true));

		await userEvent.click(canvasElement.querySelector<HTMLElement>("[data-bg]")!);
		await waitFor(() => expect(toggle).toHaveAttribute("aria-expanded", "false"));
	},
};

export const ClosesOnLinkClick: Story = {
	tags: ["!dev", "!autodocs"],
	beforeEach: speedUp,
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const nav = canvasElement.querySelector("nav")!;
		await userEvent.click(
			await canvas.findByRole("button", { name: "Open menu" }),
		);
		const toggle = await canvas.findByRole("button", { name: "Close menu" });
		await waitFor(() => expect(isFullyOpen(nav)).toBe(true));

		await userEvent.click(await canvas.findByRole("link", { name: "About" }));
		await waitFor(() => expect(toggle).toHaveAttribute("aria-expanded", "false"));
		await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
	},
};

export const InterruptsOpening: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas, canvasElement, userEvent }) => {
		const nav = canvasElement.querySelector("nav")!;

		// close right away, while the opening animation is still running
		await userEvent.click(
			await canvas.findByRole("button", { name: "Open menu" }),
		);
		await userEvent.click(canvas.getByRole("button", { name: "Close menu" }));
		await expect(
			canvas.getByRole("button", { name: "Open menu" }),
		).toHaveAttribute("aria-expanded", "false");
		await waitFor(() => expect(isShown(nav)).toBe(false), { timeout: 3000 });

		// and open it again: it plays forward to the fully open state
		await userEvent.click(canvas.getByRole("button", { name: "Open menu" }));
		await waitFor(() => expect(isFullyOpen(nav)).toBe(true), { timeout: 4000 });
	},
};

export const ReducedMotion: Story = {
	tags: ["!dev", "!autodocs"],
	beforeEach: mockReducedMotion,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const nav = canvasElement.querySelector("nav")!;
		await expect(gsap.getTweensOf(nav)).toHaveLength(0);

		await userEvent.click(
			await canvas.findByRole("button", { name: "Open menu" }),
		);
		await waitFor(() => expect(isShown(nav)).toBe(true));

		await userEvent.click(canvas.getByRole("button", { name: "Close menu" }));
		await waitFor(() => expect(isShown(nav)).toBe(false));
        await expect(gsap.getTweensOf(nav).length).toBe(0);
	},
};