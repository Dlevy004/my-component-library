import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, spyOn, waitFor } from "storybook/test";
import { ScrollUpButton } from "./ScrollUpButton";
import componentSource from "./ScrollUpButton.tsx?raw";

const meta = {
	title: "Components/Navigation/ScrollUpButton",
	component: ScrollUpButton,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			story: { inline: false, iframeHeight: 320 },
			description: {
				component:
					"A floating button that appears after scrolling down and smoothly scrolls the page back to the top. Scroll the preview to see it. Requires `lucide-react` and `Tailwind CSS v4`.",
			},
		},
	},
	decorators: [
		(Story) => (
			<>
				<div className="h-[2000px] p-6 text-neutral-500 dark:text-neutral-400">
					Scroll down to reveal the button
				</div>
				<Story />
			</>
		),
	],
	argTypes: {
		accentColor: { control: "color" },
		accentColorDark: { control: "color" },
		threshold: { control: { type: "number", min: 0, step: 50 } },
	},
} satisfies Meta<typeof ScrollUpButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: {
			source: { code: componentSource, language: "tsx", type: "code" },
		},
	},
};

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