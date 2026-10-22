import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { ThemeSwitcher } from "./ThemeSwitcher";
import componentSource from "./ThemeSwitcher.tsx?raw";

const meta = {
	title: "Components/Settings/ThemeSwitcher",
	component: ThemeSwitcher,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			story: { inline: false, iframeHeight: 140 },
			description: {
				component:
					"A toggle that switches between light and dark mode by adding a class to the `<html>` element and remembers the choice in `localStorage`. Requires `lucide-react` and `Tailwind CSS v4` with a class-based dark variant: `@custom-variant dark (&:where(.dark, .dark *));`.",
			},
		},
	},
	argTypes: { accentColor: { control: "color" } },
	beforeEach: () => {
		localStorage.removeItem("theme");
		document.documentElement.classList.remove("dark");
	},
} satisfies Meta<typeof ThemeSwitcher>;

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
	args: { label: "Témaváltás (sötét/világos)" },
};

export const StartsDark: Story = {
	beforeEach: () => {
		localStorage.setItem("theme", "dark");
	},
	play: async ({ canvas }) => {
		const button = await canvas.findByRole("button", { name: /toggle theme/i });
		await waitFor(() => expect(button).toHaveAttribute("aria-pressed", "true"));
	},
};

export const TogglesAndRemembers: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas, userEvent }) => {
		const button = await canvas.findByRole("button", { name: /toggle theme/i });
		await expect(button).toHaveAttribute("aria-pressed", "false");

		await userEvent.click(button);
		await waitFor(() => expect(button).toHaveAttribute("aria-pressed", "true"));
		await expect(document.documentElement).toHaveClass("dark");
		await expect(localStorage.getItem("theme")).toBe("dark");

		await userEvent.click(button);
		await waitFor(() => expect(button).toHaveAttribute("aria-pressed", "false"));
		await expect(document.documentElement).not.toHaveClass("dark");
		await expect(localStorage.getItem("theme")).toBe("light");
	},
};