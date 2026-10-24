import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { HamburgerButton } from "./HamburgerButton";
import componentSource from "./HamburgerButton.tsx?raw";

const description = [
	"A round icon button that opens a menu or drawer. Pair it with `Drawer` component.",
	"",
	"**Requirements**",
	"- React 18+, `pnpm add lucide-react`, Tailwind CSS v4 with a class-based dark variant (`@custom-variant dark (&:where(.dark, .dark *));`)",
	"",
	"**Good to know**",
	"- It is visible on every screen size. Hide it where it is not needed, e.g. `className=\"lg:hidden\"`.",
	"- Pass `isOpen` and `controls` (the id of the menu) so screen readers know what the button does."
].join("\n");

const meta = {
	title: "Components/Navigation/HamburgerButton",
	component: HamburgerButton,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: { description: { component: description } },
	},
	args: { onClick: fn() },
	argTypes: {
		accentColor: { control: "color" },
		accentColorDark: { control: "color" },
	},
} satisfies Meta<typeof HamburgerButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: {
			source: { code: componentSource, language: "tsx", type: "code" },
		},
	},
	play: async ({ canvas }) => {
		const button = await canvas.findByRole("button", { name: "Open menu" });
		await expect(button).toHaveAttribute("aria-expanded", "false");
	},
};

export const Open: Story = {
	args: { isOpen: true },
	play: async ({ canvas }) => {
		const button = await canvas.findByRole("button", { name: "Open menu" });
		await expect(button).toHaveAttribute("aria-expanded", "true");
	},
};

export const Localized: Story = {
	args: { label: "Menü megnyitása" },
};

export const ClickCallsHandler: Story = {
	tags: ["!dev", "!autodocs"],
	args: { controls: "mobile-nav" },
	play: async ({ canvas, userEvent, args }) => {
		const button = await canvas.findByRole("button", { name: "Open menu" });
		await expect(button).toHaveAttribute("aria-controls", "mobile-nav");
		await userEvent.click(button);
		await expect(args.onClick).toHaveBeenCalledOnce();
	},
};