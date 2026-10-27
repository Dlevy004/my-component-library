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
import { ScrollTravel, type ScrollTravelProps } from "./ScrollTravel";
import componentSource from "./ScrollTravel.tsx?raw";

const description = [
	"An element that travels across the page while the visitor scrolls. It starts where you place it, then flies from stop to stop, resizing itself to fit each stop's box. <br> Built with **[GSAP ScrollTrigger and Flip](https://demos.gsap.com/demo/scroll-waypoints/)**, adapted from a GSAP demo on CodePen.",
	"",
	"**Requirements**",
	"- React 18+, `pnpm add gsap @gsap/react`, Tailwind CSS v4",
	"",
	"**Good to know**",
	"- Stops are elements you place yourself. Keep them in state with a callback ref (`ref={setStop}`) and pass them in `targets`, or pass CSS selectors. Empty entries are skipped.",
	"- The traveler is resized to the width and height of every stop, so its child fills it (`size-full`). Use an image or another element that stretches.",
	"- It starts moving when its top reaches the middle of the screen (`start`) and arrives at the last stop when that stop's top reaches the middle (`end`). Set `endTrigger` to end later, e.g. on a spacer after the last stop.",
	"- `hold` is the pause between two stops. `smoothing` lets the traveler catch up with the scroll position, which hides the stepping of a mouse wheel.",
	"- The traveler, the stops and `endTrigger` must scroll together. Do not put stops in fixed or sticky elements.",
	"- Positions are measured when the component mounts and when the window is resized. If the layout changes later (e.g. images load), remount it by changing its `key`.",
	"- By default it follows the page scroll. Pass `scrollContainer` to follow a scrollable element instead. The examples on this page do that, so scroll the box.",
	"- With reduced motion enabled, the traveler stays where it is.",
	"- The example image is hotlinked from CodePen. Replace it with your own.",
].join("\n");

const usageSnippet = `import { useState } from "react";
import { ScrollTravel } from "./components/ScrollTravel/ScrollTravel";

export function Section() {
	const [stopOne, setStopOne] = useState<HTMLElement | null>(null);
	const [stopTwo, setStopTwo] = useState<HTMLElement | null>(null);

	return (
		<div className="relative h-200">
			<ScrollTravel targets={[stopOne, stopTwo]}>
				<img src="/images/ball.png" alt="" />
			</ScrollTravel>
			<div ref={setStopOne} className="absolute top-1/2 left-[10%] size-25" />
			<div ref={setStopTwo} className="absolute right-[10%] bottom-12 size-25" />
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

const traveler = (
	<img src="https://assets.codepen.io/16327/circle.png" alt="" />
);

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
			className={`absolute grid size-35 place-items-center rounded-[10px] border-2 border-dashed border-neutral-400 dark:border-neutral-600 ${className}`}
		>
			{children}
		</div>
	);
}

// The traveler starts in the first box and flies to the other two
function FlightDemo(args: ScrollTravelProps) {
	const [second, setSecond] = useState<HTMLElement | null>(null);
	const [third, setThird] = useState<HTMLElement | null>(null);
	const [finalSpacer, setFinalSpacer] = useState<HTMLElement | null>(null);

	return (
		<>
			<Spacer className="h-80">Scroll down</Spacer>
			<div className="relative h-200">
				<Slot className="top-[10%] left-[60%]">
					<ScrollTravel
						{...args}
						targets={[second, third]}
						endTrigger={finalSpacer}
					/>
				</Slot>
				<Slot className="top-1/2 left-[10%]">
					<div ref={setSecond} data-testid="stop-2" className="size-25" />
				</Slot>
				<Slot className="right-[10%] bottom-12">
					<div ref={setThird} data-testid="stop-3" className="size-25" />
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

const rectOf = (element: Element) => element.getBoundingClientRect();

const meta = {
	title: "Components/Scroll/ScrollTravel",
	component: ScrollTravel,
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
	args: { targets: [], children: traveler },
	argTypes: {
		children: { control: false },
		targets: { control: false },
		endTrigger: { control: false },
		scrollContainer: { control: false },
	},
	render: (args) => <FlightDemo {...args} />,
} satisfies Meta<typeof ScrollTravel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: { source: { type: "code", language: "tsx", code: usageSnippet } },
	},
};

export const ExactScrub: Story = {
	args: { smoothing: 0 },
};

export const LongPause: Story = {
	args: { hold: 2 },
};

export const BuildsTimeline: Story = {
	tags: ["!dev", "!autodocs"],
	play: async () => {
		await waitFor(() => expect(ScrollTrigger.getAll().length).toBe(1));
	},
};

export const ReachesEveryStop: Story = {
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
		const traveler = canvasElement.querySelector("[data-scroll-travel]")!;
		const stop2 = await canvas.findByTestId("stop-2");
		const stop3 = await canvas.findByTestId("stop-3");
		await waitFor(() => expect(ScrollTrigger.getAll().length).toBe(1));

		const near = (a: DOMRect, b: DOMRect) =>
			Math.abs(a.left - b.left) < 3 && Math.abs(a.top - b.top) < 3;

		// at the end of the scroll it sits on the last stop
		scroller.scrollTo({ top: scroller.scrollHeight });
		await waitFor(() =>
			expect(near(rectOf(traveler), rectOf(stop3))).toBe(true),
		);

		// scrolling back up carries it back to the start
		scroller.scrollTo({ top: 0 });
		await waitFor(() =>
			expect(near(rectOf(traveler), rectOf(stop2))).toBe(false),
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
						<ScrollTravel
							{...args}
							targets={[null, "[data-selector-stop]"]}
							smoothing={0}
							scrollContainer={container}
						/>
						<div
							data-selector-stop=""
							data-testid="selector-stop"
							className="absolute right-[10%] bottom-12 size-25"
						/>
					</div>
					<div className="h-105" />
				</>
			)}
		/>
	),
	play: async ({ canvas, canvasElement }) => {
		const scroller = await canvas.findByTestId("scroller");
		const traveler = canvasElement.querySelector("[data-scroll-travel]")!;
		const stop = await canvas.findByTestId("selector-stop");
		await waitFor(() => expect(ScrollTrigger.getAll().length).toBe(1));

		scroller.scrollTo({ top: scroller.scrollHeight });
		await waitFor(() =>
			expect(Math.abs(rectOf(traveler).left - rectOf(stop).left)).toBeLessThan(3),
		);
	},
};

export const NoStopsDoesNothing: Story = {
	tags: ["!dev", "!autodocs"],
	render: (args) => <ScrollTravel {...args} targets={[]} />,
	play: async ({ canvasElement }) => {
		await waitFor(() =>
			expect(canvasElement.querySelector("[data-scroll-travel]")).not.toBeNull(),
		);
		await expect(ScrollTrigger.getAll().length).toBe(1);
	},
};

export const ReducedMotionStaysStatic: Story = {
	tags: ["!dev", "!autodocs"],
	beforeEach: mockReducedMotion,
	play: async ({ canvasElement }) => {
		const traveler = await waitFor(() => {
			const element = canvasElement.querySelector("[data-scroll-travel]");
			expect(element).not.toBeNull();
			return element as HTMLElement;
		});
		await expect(ScrollTrigger.getAll().length).toBe(1);
		await expect(traveler.style.transform).toBe("");
	},
};

export const RebuildsOnResize: Story = {
	tags: ["!dev", "!autodocs"],
	play: async () => {
		await waitFor(() => expect(ScrollTrigger.getAll().length).toBe(1));
		const before = ScrollTrigger.getAll()[0];

		window.dispatchEvent(new Event("resize"));
		await waitFor(() => expect(ScrollTrigger.getAll()[0] === before).toBe(false), {
			timeout: 2000,
		});
		await expect(ScrollTrigger.getAll().length).toBe(1);
	},
};