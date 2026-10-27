import { useState, type ReactNode } from "react";
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
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { expect, waitFor } from "storybook/test";
import { HorizontalScrollGallery } from "./HorizontalScrollGallery";
import componentSource from "./HorizontalScrollGallery.tsx?raw";

const description = [
	"A row of square images that slides sideways while the visitor scrolls down. The gallery is pinned in the middle of the screen until the last image has passed, then the page continues.\n\nBuilt with **[GSAP ScrollTrigger](https://demos.gsap.com/demo/horizontal-scrolling-gallery/)**, adapted from a horizontal scrolling demo on CodePen.",
	"",
	"**Requirements**",
	"- React 18",
    "- `pnpm add gsap @gsap/react`",
    "- Tailwind CSS v4",
	"",
	"**Good to know**",
	"- The gallery adds scroll space: while stays in place, the visitor scrolls as far as the strip is wide. Put content before and after it, otherwise there is nothing to scroll to or from.",
	"- `itemWidth` is the width of the image, each tile also has 2rem of padding around it. By default the image fills the screen width on phones (one image at a time) and is a third of the gallery's width on wide screens. `cqw` units are a percent of the gallery's own width, so give the gallery a parent with a definite width.",
	"- By default it follows the page scroll. Pass `scrollContainer` to follow a scrollable element instead. The examples on this page do that, so scroll the box.",
	"- Sizes are recalculated when the window is resized, not when only a container changes size.",
	"- With reduced motion enabled, nothing is pinned and the row can be swiped or scrolled sideways.",
	"- The example images are hotlinked from CodePen. Replace them with your own.",
    "- `smoothing` (1 second by default) lets the strip catch up with the scroll position, which hides the stepping of a mouse wheel. Use 0 to follow the scroll exactly, or a value up to about 2 for a lazier feel.",
].join("\n");

const usageSnippet = `import { HorizontalScrollGallery } from "./components/HorizontalScrollGallery/HorizontalScrollGallery";

<HorizontalScrollGallery
	label="Our work"
	images={[
		{ src: "/images/project-1.jpg", alt: "Kitchen renovation" },
		{ src: "/images/project-2.jpg", alt: "Garden house" },
		{ src: "/images/project-3.jpg", alt: "Office lobby" },
	]}
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

const images = Array.from({ length: 8 }, (_, index) => ({
	src: `https://assets.codepen.io/16327/portrait-image-${index + 1}.jpg`,
}));

function Panel({
	children,
	className,
}: {
	readonly children: ReactNode;
	readonly className: string;
}) {
	return (
		<section
			className={`grid place-items-center text-xl font-semibold text-neutral-900 dark:text-neutral-100 ${className}`}
		>
			<h3>{children}</h3>
		</section>
	);
}

// A scrollable box that drives the animation. It only renders its content once
// the box exists, because ScrollTrigger needs the element.
function ScrollArea({
	render,
}: {
	readonly render: (container: HTMLElement) => ReactNode;
}) {
	const [container, setContainer] = useState<HTMLElement | null>(null);

	return (
		<div
			ref={setContainer}
			data-testid="scroller"
			className="h-105 overflow-y-auto rounded-lg bg-white ring-1 ring-neutral-300 dark:bg-neutral-900 dark:ring-neutral-700"
		>
			{container && (
				<>
					<Panel className="h-105">Scroll down for the gallery</Panel>
					{render(container)}
					<Panel className="h-105">That&apos;s it!</Panel>
				</>
			)}
		</div>
	);
}

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

const meta = {
	title: "Components/Scroll/HorizontalScrollGallery",
	component: HorizontalScrollGallery,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: DocsPage,
			description: { component: description },
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
					<Panel className="h-screen">Scroll down for the gallery</Panel>
					<Story />
					<Panel className="h-screen">That&apos;s it!</Panel>
				</>
			),
	],
	args: { images },
	argTypes: {
		scrollContainer: { control: false },
		images: { control: "object" },
	},
} satisfies Meta<typeof HorizontalScrollGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: { source: { type: "code", language: "tsx", code: usageSnippet } },
	},
};

export const Localized: Story = {
	args: {
		label: "Képgaléria",
		images: images.map((image, index) => ({
			...image,
			alt: `Portré ${index + 1}`,
		})),
	},
};

export const WideItems: Story = {
	args: { itemWidth: "50cqw" },
};

export const BuildsScrollTimeline: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const group = await canvas.findByRole("group", { name: "Image gallery" });
		await waitFor(() => expect(ScrollTrigger.getAll().length).toBe(1));
		// the outer box gets extra height for the scroll distance
		await expect(Number.parseFloat(group.style.height)).toBeGreaterThan(
			group.firstElementChild!.getBoundingClientRect().height,
		);
	},
};

export const ReducedMotionStaysStatic: Story = {
	tags: ["!dev", "!autodocs"],
	beforeEach: mockReducedMotion,
	play: async ({ canvas }) => {
		const group = await canvas.findByRole("group", { name: "Image gallery" });
		await expect(ScrollTrigger.getAll().length).toBe(1);
		await expect(group.style.height).toBe("");
	},
};

export const FollowsScrollContainer: Story = {
	tags: ["!dev", "!autodocs"],
	render: (args) => (
		<ScrollArea
			render={(container) => (
				<HorizontalScrollGallery {...args} scrollContainer={container} />
			)}
		/>
	),
	play: async ({ canvas }) => {
		const scroller = await canvas.findByTestId("scroller");
		const group = await canvas.findByRole("group", { name: "Image gallery" });
		const strip = group.firstElementChild!.firstElementChild as HTMLElement;
		await waitFor(() => expect(ScrollTrigger.getAll().length).toBe(1));
		await expect(gsap.getProperty(strip, "x")).toBe(0);

		// scrolling the box slides the strip sideways
		scroller.scrollTo({ top: 1500 });
		await waitFor(() =>
			expect(gsap.getProperty(strip, "x") as number).toBeLessThan(0),
		);
	},
};

export const ExactScrub: Story = {
	args: { smoothing: 0 },
};

export const FillsNarrowScreens: Story = {
	tags: ["!dev", "!autodocs"],
	decorators: [
		(Story) => (
			<div style={{ width: 390 }}>
				<Story />
			</div>
		),
	],
	play: async ({ canvas }) => {
		const group = await canvas.findByRole("group", { name: "Image gallery" });
		const image = group.querySelector("img")!;
		await waitFor(() =>
			expect(
				Math.abs(image.getBoundingClientRect().width - (390 - 64)),
			).toBeLessThan(2),
		);
	},
};