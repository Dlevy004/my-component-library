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
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { expect, waitFor } from "storybook/test";
import { ScrollBentoGallery } from "./ScrollBentoGallery";
import componentSource from "./ScrollBentoGallery.tsx?raw";

const description = [
	"A bento-style image grid that expands to fill its box as the visitor scrolls. The page pins in place while the images grow, then scrolling continues. <br> Built with **GSAP** ScrollTrigger and Flip, adapted from a GSAP demo on CodePen.",
	"",
	"**Requirements**",
	"- React 18+, `pnpm add gsap @gsap/react`, Tailwind CSS v4",
	"",
	"**Good to know**",
	"- Up to 8 images, in a fixed layout. Extra images are ignored. Images are cropped to fit (`object-fit: cover`).",
	"- Sizes use container units, so the grid fits the `height` you set (`100vh` by default, the full screen). Give it a box with a definite width.",
	"- The gallery is pinned while the visitor scrolls `scrollDistance` (`\"+=100%\"` is one box height), so it adds that much scroll space. Put content after it, otherwise there is nothing to scroll to.",
	"- By default it follows the page scroll. Pass `scrollContainer` to follow a scrollable element instead. The examples on this page do that: scroll the box.",
	"- The animation is rebuilt when the window is resized, not when only the container changes size.",
	"- With reduced motion enabled, the grid stays static.",
	"- The example images are hotlinked from **CodePen**. Replace them with your own."
].join("\n");

const usageImport = `import { ScrollBentoGallery } from "./components/ScrollBentoGallery/ScrollBentoGallery";`;

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

const images = [
	"portrait-pattern-1",
	"portrait-image-12",
	"portrait-image-8",
	"portrait-pattern-2",
	"portrait-image-4",
	"portrait-image-3",
	"portrait-pattern-3",
	"portrait-image-1",
].map((name) => ({ src: `https://assets.codepen.io/16327/${name}.jpg` }));

function Filler() {
	return (
		<div className="px-8 py-8 text-neutral-900 md:px-20 dark:text-neutral-100">
			<h2 className="mb-4 text-2xl font-bold">Here is some content</h2>
			{Array.from({ length: 4 }, (_, index) => (
				<p key={index} className="mb-4 text-lg">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
					eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
					minim veniam, quis nostrud exercitation ullamco laboris nisi ut
					aliquip ex ea commodo consequat.
				</p>
			))}
		</div>
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
			className="h-[420px] overflow-y-auto rounded-lg ring-1 ring-neutral-300 dark:ring-neutral-700"
		>
			{container && render(container)}
			<Filler />
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
	title: "Components/Scroll/ScrollBentoGallery",
	component: ScrollBentoGallery,
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
						<Story
							args={{
								...context.args,
								height: context.args.height ?? "420px",
								scrollContainer: container,
							}}
						/>
					)}
				/>
			) : (
				<>
					<Story />
					<Filler />
				</>
			),
	],
	args: { images },
	argTypes: {
		scrollContainer: { control: false },
		images: { control: "object" },
	},
} satisfies Meta<typeof ScrollBentoGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Localized: Story = {
	args: {
		label: "Képgaléria",
		images: images.map((image, index) => ({
			...image,
			alt: `Portré ${index + 1}`,
		})),
	},
};

export const ShortScroll: Story = {
	args: { scrollDistance: "+=50%" },
};

export const BuildsPinnedTimeline: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const group = await canvas.findByRole("group", { name: "Image gallery" });
		await waitFor(() => expect(ScrollTrigger.getAll()).toHaveLength(1));
		await expect(group.parentElement).toHaveClass("pin-spacer");
	},
};

export const ReducedMotionStaysStatic: Story = {
	tags: ["!dev", "!autodocs"],
	beforeEach: mockReducedMotion,
	play: async ({ canvas }) => {
		const group = await canvas.findByRole("group", { name: "Image gallery" });
		await expect(ScrollTrigger.getAll()).toHaveLength(0);
		await expect(group.parentElement).not.toHaveClass("pin-spacer");
	},
};

export const FollowsScrollContainer: Story = {
	tags: ["!dev", "!autodocs"],
	render: (args) => (
		<ScrollArea
			render={(container) => (
				<ScrollBentoGallery
					{...args}
					height="420px"
					scrollContainer={container}
				/>
			)}
		/>
	),
	play: async ({ canvas }) => {
		const scroller = await canvas.findByTestId("scroller");
		const group = await canvas.findByRole("group", { name: "Image gallery" });
		await waitFor(() => expect(ScrollTrigger.getAll()).toHaveLength(1));

		const firstTile = group.firstElementChild!.firstElementChild as HTMLElement;
		const before = firstTile.style.cssText;
		scroller.scrollTo({ top: 400 });
		await waitFor(() => expect(firstTile.style.cssText).not.toBe(before));
	},
};

export const RebuildsOnResize: Story = {
	tags: ["!dev", "!autodocs"],
	play: async () => {
		await waitFor(() => expect(ScrollTrigger.getAll()).toHaveLength(1));
		const before = ScrollTrigger.getAll()[0];

		window.dispatchEvent(new Event("resize"));
		await waitFor(() => expect(ScrollTrigger.getAll()[0]).not.toBe(before), {
			timeout: 2000,
		});
		await expect(ScrollTrigger.getAll()).toHaveLength(1);
	},
};