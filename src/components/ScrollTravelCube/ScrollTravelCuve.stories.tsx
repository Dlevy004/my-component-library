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
import { WebGLRenderer, type Scene } from "three";
import { expect, spyOn, waitFor } from "storybook/test";
import {
	ScrollTravelCube,
	type ScrollTravelCubeProps,
} from "./ScrollTravelCube";
import componentSource from "./ScrollTravelCube.tsx?raw";

const description = [
	"A 3D cube that travels across the page while the visitor scrolls. It starts where you place it, then flies from stop to stop, resizing itself to fit each stop's box, and turns on the way. <br> Built with **Three.js**, **[GSAP ScrollTrigger and Flip](https://demos.gsap.com/demo/threejs-scroll-waypoints/)**, adapted from a GSAP demo on CodePen. It works like `ScrollTravel`, with a cube instead of your own content.",
	"",
	"**Requirements**",
	"- React 19 (React 18 works, but warns about a layout effect when server-rendering), `pnpm add gsap @gsap/react three` and `pnpm add -D @types/three`, Tailwind CSS v4",
	"",
	"**Good to know**",
	"- Stops are elements you place yourself. Keep them in state with a callback ref (`ref={setStop}`) and pass them in `targets`, or pass CSS selectors. Empty entries are skipped.",
	"- The cube starts moving when its starting place reaches the middle of the screen (`start`) and arrives at the last stop when that stop's top reaches the middle (`end`). Set `endTrigger` to end later, e.g. on a spacer after the last stop.",
	"- The texture is painted in code, so no image files are needed. Change it with `colorA` and `colorB`. `spin` sets how far the cube turns between two stops.",
	"- The scene is only drawn when something changes (scrolling, resizing, new colors), so it costs nothing while the page is still.",
	"- It needs WebGL. Without it the canvas stays empty and nothing animates.",
	"- Three.js is a large dependency. If the cube is far down the page, load the component lazily.",
	"- The traveler, the stops and `endTrigger` must scroll together. Do not put stops in fixed or sticky elements.",
	"- Positions are measured when the component mounts and when the window is resized. If the layout changes later, remount it by changing its `key`.",
	"- By default it follows the page scroll. Pass `scrollContainer` to follow a scrollable element instead. The examples on this page do that, so scroll the box.",
	"- With reduced motion enabled, the cube stays where it is and does not turn.",
].join("\n");

const usageSnippet = `import { useState } from "react";
import { ScrollTravelCube } from "./components/ScrollTravelCube/ScrollTravelCube";

export function Section() {
	const [stopOne, setStopOne] = useState<HTMLElement | null>(null);
	const [stopTwo, setStopTwo] = useState<HTMLElement | null>(null);

	return (
		<div className="relative h-200">
			<ScrollTravelCube targets={[stopOne, stopTwo]} />
			<div ref={setStopOne} className="absolute top-1/2 left-[10%] size-40" />
			<div ref={setStopTwo} className="absolute right-[10%] bottom-12 size-40" />
		</div>
	);
}`;

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

function Spacer({
	children,
	className,
}: {
	readonly children?: ReactNode;
	readonly className: string;
}) {
	return (
		<div
			className={`grid place-items-center text-xl font-semibold text-neutral-900 dark:text-neutral-100 ${className}`}
		>
			{children}
		</div>
	);
}

// A dashed box that marks a place on the page
function Slot({
	className,
	children,
}: {
	readonly className: string;
	readonly children: ReactNode;
}) {
	return (
		<div
			className={`absolute grid size-50 place-items-center rounded-xl border-2 border-dashed border-neutral-400 dark:border-neutral-600 ${className}`}
		>
			{children}
		</div>
	);
}

// The cube starts in the first box and flies to the other two
function FlightDemo(args: ScrollTravelCubeProps) {
	const [second, setSecond] = useState<HTMLElement | null>(null);
	const [third, setThird] = useState<HTMLElement | null>(null);
	const [finalSpacer, setFinalSpacer] = useState<HTMLElement | null>(null);

	return (
		<>
			<Spacer className="h-80">Scroll down</Spacer>
			<div className="relative h-200">
				<Slot className="top-[10%] left-[60%]">
					<ScrollTravelCube
						{...args}
						targets={[second, third]}
						endTrigger={finalSpacer}
					/>
				</Slot>
				<Slot className="top-1/2 left-[10%]">
					<div ref={setSecond} data-testid="stop-2" className="size-40" />
				</Slot>
				<Slot className="right-[10%] bottom-12">
					<div ref={setThird} data-testid="stop-3" className="size-40" />
				</Slot>
			</div>
			<div ref={setFinalSpacer} className="h-105" />
		</>
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
			{container && render(container)}
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

// Pretends the browser has no WebGL (2D canvases keep working)
const mockNoWebGL = () => {
	const original = HTMLCanvasElement.prototype.getContext;
	HTMLCanvasElement.prototype.getContext = function (
		this: HTMLCanvasElement,
		type: string,
	) {
		return type === "2d" ? original.call(this, "2d") : null;
	} as typeof original;
	return () => {
		HTMLCanvasElement.prototype.getContext = original;
	};
};

const rectOf = (element: Element) => element.getBoundingClientRect();

const meta = {
	title: "Components/Scroll/ScrollTravelCube",
	component: ScrollTravelCube,
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
				<Story />
			),
	],
	args: { targets: [] },
	argTypes: {
		targets: { control: false },
		endTrigger: { control: false },
		scrollContainer: { control: false },
		colorA: { control: "color" },
		colorB: { control: "color" },
		spin: { control: { type: "range", min: 0, max: 4, step: 0.5 } },
	},
	render: (args) => <FlightDemo {...args} />,
} satisfies Meta<typeof ScrollTravelCube>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: { source: { type: "code", language: "tsx", code: usageSnippet } },
	},
};

export const Localized: Story = {
	args: { label: "Forgó kocka" },
};

export const GreenCube: Story = {
	args: { colorA: "#bbf7d0", colorB: "#15803d" },
};

export const FastSpin: Story = {
	args: { spin: 3 },
};

export const RendersWebGLCube: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		const cube = (await canvas.findByRole("img", {
			name: "Rotating cube",
		})) as HTMLCanvasElement;
		await waitFor(() =>
			expect(cube.getContext("webgl2") ?? cube.getContext("webgl")).not.toBeNull(),
		);
	},
};

export const BuildsTimeline: Story = {
	tags: ["!dev", "!autodocs"],
	play: async () => {
		await waitFor(() => expect(ScrollTrigger.getAll()).toHaveLength(1));
	},
};

export const ReachesEveryStopAndTurns: Story = {
	tags: ["!dev", "!autodocs"],
	args: { smoothing: 0 },
	render: (args) => (
		<ScrollArea
			render={(container) => (
				<FlightDemo {...args} scrollContainer={container} />
			)}
		/>
	),
	play: async ({ canvas, canvasElement }) => {
		const scroller = await canvas.findByTestId("scroller");
		const traveler = canvasElement.querySelector("[data-scroll-travel-cube]")!;
		const stop3 = await canvas.findByTestId("stop-3");
		await waitFor(() => expect(ScrollTrigger.getAll()).toHaveLength(1));

		const renderSpy = spyOn(WebGLRenderer.prototype, "render");
		try {
			// scrolling down turns the cube, so the scene is drawn with a rotation
			scroller.scrollTo({ top: 600 });
			await waitFor(() => {
				const scene = renderSpy.mock.lastCall?.[0] as Scene | undefined;
				expect(scene?.children[0].rotation.x ?? 0).toBeGreaterThan(0);
			});
		} finally {
			renderSpy.mockRestore();
		}

		// at the end of the scroll it sits on the last stop
		scroller.scrollTo({ top: scroller.scrollHeight });
		await waitFor(() =>
			expect(
				Math.abs(rectOf(traveler).left - rectOf(stop3).left),
			).toBeLessThan(3),
		);
	},
};

export const AcceptsSelectorsAndSkipsEmptyStops: Story = {
	tags: ["!dev", "!autodocs"],
	render: (args) => (
		<ScrollArea
			render={(container) => (
				<>
					<Spacer className="h-80" />
					<div className="relative h-200">
						<ScrollTravelCube
							{...args}
							targets={[null, "[data-selector-stop]"]}
							smoothing={0}
							scrollContainer={container}
						/>
						<div
							data-selector-stop=""
							data-testid="selector-stop"
							className="absolute right-[10%] bottom-12 size-40"
						/>
					</div>
					<div className="h-105" />
				</>
			)}
		/>
	),
	play: async ({ canvas, canvasElement }) => {
		const scroller = await canvas.findByTestId("scroller");
		const traveler = canvasElement.querySelector("[data-scroll-travel-cube]")!;
		const stop = await canvas.findByTestId("selector-stop");
		await waitFor(() => expect(ScrollTrigger.getAll()).toHaveLength(1));

		scroller.scrollTo({ top: scroller.scrollHeight });
		await waitFor(() =>
			expect(Math.abs(rectOf(traveler).left - rectOf(stop).left)).toBeLessThan(3),
		);
	},
};

export const NoStopsDoesNothing: Story = {
	tags: ["!dev", "!autodocs"],
	render: (args) => <ScrollTravelCube {...args} targets={[]} />,
	play: async ({ canvas }) => {
		await canvas.findByRole("img", { name: "Rotating cube" });
		await expect(ScrollTrigger.getAll()).toHaveLength(0);
	},
};

export const ReducedMotionStaysStill: Story = {
	tags: ["!dev", "!autodocs"],
	beforeEach: mockReducedMotion,
	play: async ({ canvas, canvasElement }) => {
		await canvas.findByRole("img", { name: "Rotating cube" });
		await expect(ScrollTrigger.getAll()).toHaveLength(0);
		const traveler = canvasElement.querySelector<HTMLElement>(
			"[data-scroll-travel-cube]",
		)!;
		await expect(traveler.style.transform).toBe("");
	},
};

export const WithoutWebGL: Story = {
	tags: ["!dev", "!autodocs"],
	beforeEach: mockNoWebGL,
	play: async ({ canvas }) => {
		// the canvas stays empty, nothing is animated and nothing crashes
		await canvas.findByRole("img", { name: "Rotating cube" });
		await expect(ScrollTrigger.getAll()).toHaveLength(0);
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