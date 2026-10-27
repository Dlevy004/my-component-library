import type { ReactNode } from "react";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Canvas,
	Controls,
	Description,
	Stories,
	Title,
} from "@storybook/addon-docs/blocks";
import { expect, spyOn, waitFor } from "storybook/test";
import { ScrollUpButton } from "./ScrollUpButton";
import componentSource from "./ScrollUpButton.tsx?raw";

const description = [
	"A floating button that appears after scrolling down and smoothly scrolls the page back to the top. Use it on long pages.",
	"",
	"**Requirements**",
	"- React 18+, `pnpm add lucide-react`, Tailwind CSS v4 with a class-based dark variant (`@custom-variant dark (&:where(.dark, .dark *));`)",
	"",
	"**Good to know**",
	"- It is fixed to the bottom right corner and appears after scrolling `threshold` pixels (500 by default).",
	"- By default it watches the page. Pass `scrollContainer` (a scrollable element) to watch and scroll that element instead. The examples on this page do that, so scroll the box to see the button and use Controls to change it.",
	"- It scrolls instantly when the visitor prefers reduced motion.",
	"- While hidden it is removed from the tab order and from screen readers.",
].join("\n");

const usageImport = `import { ScrollUpButton } from "./components/ScrollUpButton/ScrollUpButton";`;

function DocsPage() {
	return (
		<>
			<Title />
			<Description />
			<Canvas
				of={Default}
				source={{ code: componentSource, language: "tsx" }}
			/>
			<Controls />
			<Stories includePrimary />
		</>
	);
}

// A scrollable box plus the button. The transformed outer box keeps the fixed
// button inside it, the inner box does the scrolling.
function ScrollArea({
	render,
}: {
	readonly render: (container: HTMLElement) => ReactNode;
}) {
	const [container, setContainer] = useState<HTMLElement | null>(null);

	return (
		<div
			className="relative h-64 overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700"
			style={{ transform: "translateZ(0)" }}
		>
			<div
				ref={setContainer}
				data-testid="scroller"
				className="h-full overflow-y-auto"
			>
				<div className="h-[1500px] p-6 text-center text-neutral-500 dark:text-neutral-400">
					Scroll this box to reveal the button
				</div>
			</div>
			{container && render(container)}
		</div>
	);
}

const meta = {
	title: "Components/Scroll/ScrollUpButton",
	component: ScrollUpButton,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: DocsPage,
			description: { component: description },
			source: {
				transform: (code: string) =>
					code.trimStart().startsWith("<")
						? `${usageImport}\n\n${code}`
						: code,
			},
		},
	},
	decorators: [
		(Story, context) =>
			context.viewMode === "docs" ? (
				<ScrollArea
					render={(container) => (
						<Story args={{ ...context.args, scrollContainer: container }} />
					)}
				/>
			) : (
				<>
					<div className="h-[2000px] p-6 text-center text-neutral-500 dark:text-neutral-400">
						Scroll down to reveal the button
					</div>
					<Story />
				</>
			),
	],
	argTypes: {
		scrollContainer: { control: false },
		accentColor: { control: "color" },
		accentColorDark: { control: "color" },
		threshold: { control: { type: "number", min: 0, step: 50 } },
	},
} satisfies Meta<typeof ScrollUpButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Localized: Story = {
	args: { label: "Ugrás az oldal tetejére" },
};

export const EarlyThreshold: Story = {
	args: { threshold: 100 },
};

export const ScrollsToTop: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas, userEvent }) => {
		window.scrollTo({ top: 800 });
		const button = await canvas.findByRole("button", { name: "Scroll to top" });
		await userEvent.click(button);
		await waitFor(() => expect(window.scrollY).toBe(0), { timeout: 3000 });
	},
};

export const ScrollsContainerToTop: Story = {
	tags: ["!dev", "!autodocs"],
	render: (args) => (
		<ScrollArea
			render={(container) => (
				<ScrollUpButton {...args} scrollContainer={container} />
			)}
		/>
	),
	play: async ({ canvas, userEvent }) => {
		const scroller = await canvas.findByTestId("scroller");
		scroller.scrollTo({ top: 800 });
		const button = await canvas.findByRole("button", { name: "Scroll to top" });
		await userEvent.click(button);
		await waitFor(() => expect(scroller.scrollTop).toBe(0), { timeout: 3000 });
	},
};

export const ReducedMotion: Story = {
	tags: ["!dev", "!autodocs"],
	beforeEach: () => {
		const originalMatchMedia = window.matchMedia;
		window.matchMedia = ((query: string) =>
			({
				matches: query.includes("prefers-reduced-motion"),
				media: query,
			}) as MediaQueryList) as typeof window.matchMedia;

		// cleanup: runs after the story, even if the test fails
		return () => {
			window.matchMedia = originalMatchMedia;
		};
	},
	play: async ({ canvas, userEvent }) => {
		window.scrollTo({ top: 800 });
		const button = await canvas.findByRole("button", { name: "Scroll to top" });

		const scrollSpy = spyOn(window, "scrollTo");
		try {
			await userEvent.click(button);
			await expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
		} finally {
			scrollSpy.mockRestore();
		}
	},
};