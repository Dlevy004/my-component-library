import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { Drawer } from "../Drawer/Drawer";
import { HamburgerButton } from "../HamburgerButton/HamburgerButton";
import { TopBar, type TopBarProps } from "./TopBar";
import componentSource from "./TopBar.tsx?raw";

const description = [
	"A page header with a centered title and slots for content on both sides, such as a profile button or a hamburger button. It only provides the frame, so your own buttons and menus stay in your project.",
	"",
	"**Requirements**",
	"- React 18+, Tailwind CSS v4 with a class-based dark variant (`@custom-variant dark (&:where(.dark, .dark *));`)",
	"",
	"**Good to know**",
	"- The title is the page's `h1`.",
	"- By default the bar floats at the top of the viewport. Add top padding (about `pt-28`) to your page content, or set `fixed={false}` to keep it in the page flow.",
	"- The title stays centered whatever is in `start` and `end`.",
	"- See the `WithDrawer` example for combining it with `HamburgerButton` and `Drawer`.",
].join("\n");

const profileButton = (
	<button
		type="button"
		aria-label="Profile"
		className="grid size-10 cursor-pointer place-items-center rounded-full border-none bg-neutral-300 font-bold text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100"
	>
		AB
	</button>
);

function WithDrawerDemo(args: TopBarProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<TopBar
				{...args}
				end={
					<>
						{profileButton}
						<HamburgerButton
							controls="demo-drawer"
							isOpen={open}
							onClick={() => setOpen(true)}
						/>
					</>
				}
			/>
			<Drawer id="demo-drawer" open={open} onClose={() => setOpen(false)}>
				<nav aria-label="Demo navigation" className="flex flex-col items-end gap-4 text-lg">
					<a href="#home">Home</a>
					<a href="#about">About</a>
				</nav>
			</Drawer>
		</>
	);
}

const meta = {
	title: "Components/Navigation/TopBar",
	component: TopBar,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			story: { inline: true, iframeHeight: 240 },
			description: { component: description },
		},
	},
	decorators: [
		(Story, { args }) => (
			<>
				<Story />
				<main
					className={`p-6 text-neutral-600 dark:text-neutral-400 text-center ${args.fixed === false ? "" : "pt-28"}`}
				>
					Page content
				</main>
			</>
		),
	],
	args: { title: "[Page Title]" },
	argTypes: { start: { control: false }, end: { control: false } },
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { end: profileButton },
	parameters: {
		docs: {
			source: { code: componentSource, language: "tsx", type: "code" },
		},
	},
	play: async ({ canvas }) => {
		const heading = await canvas.findByRole("heading", {
			level: 1,
			name: "Clients",
		});
		await expect(heading.closest("header")).toHaveClass("fixed");
	},
};

export const InPageFlow: Story = {
	args: { fixed: false, title: "[Page Title]", end: profileButton },
	play: async ({ canvas }) => {
		const heading = await canvas.findByRole("heading", { level: 1 });
		const header = heading.closest("header");
		await expect(header).toHaveClass("relative");
		await expect(header).not.toHaveClass("fixed");
	},
};

export const WithDrawer: Story = {
	render: (args) => <WithDrawerDemo {...args} />,
};

export const OpensDrawerFromHamburger: Story = {
	...WithDrawer,
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas, userEvent }) => {
		const button = await canvas.findByRole("button", { name: "Open menu" });
		await expect(button).toHaveAttribute("aria-expanded", "false");
		await userEvent.click(button);
		const dialog = await canvas.findByRole("dialog", { name: "Menu" });
		await waitFor(() => expect(dialog).toHaveAttribute("data-shown"));
		await expect(
			canvas.getByRole("button", { name: "Open menu" }),
		).toHaveAttribute("aria-expanded", "true");
	},
};