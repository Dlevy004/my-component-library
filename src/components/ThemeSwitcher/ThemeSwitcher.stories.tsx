import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Canvas,
	Controls,
	Description,
	Stories,
	Title,
} from "@storybook/addon-docs/blocks";
import { expect, waitFor } from "storybook/test";
import { ThemeSwitcher } from "./ThemeSwitcher";
import componentSource from "./ThemeSwitcher.tsx?raw";

const description = [
	"A toggle that switches between light and dark mode. It adds a class to the `<html>` element and remembers the choice in `localStorage`.",
	"",
	"**Requirements**",
	"- React 18+, `pnpm add lucide-react`, Tailwind CSS v4 with a class-based dark variant (`@custom-variant dark (&:where(.dark, .dark *));`)",
	"",
	"**Good to know**",
	"- The stored choice (`\"dark\"` or `\"light\"`, key `storageKey`) is applied after the page loads.",
	"- `darkClass` must match the class your Tailwind dark variant uses."
].join("\n");

const usageImport = `import { ThemeSwitcher } from "./components/ThemeSwitcher/ThemeSwitcher";`;

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

const meta = {
	title: "Components/Settings/ThemeSwitcher",
	component: ThemeSwitcher,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			page: DocsPage,
			description: { component: description },
            story: { inline: true, iframeHeight: 140 },
			source: {
				transform: (code: string) =>
					code.trimStart().startsWith("<")
						? `${usageImport}\n\n${code}`
						: code,
			},
		},
	},
	argTypes: { accentColor: { control: "color" } },
	beforeEach: () => {
		localStorage.removeItem("theme");
		if (document.documentElement.classList.contains("dark")) {
			document.documentElement.classList.remove("dark");
		}
	},
} satisfies Meta<typeof ThemeSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Localized: Story = {
	args: { label: "Témaváltás (sötét/világos)" },
};

// The stories below change global state (the <html> class and localStorage),
// so they stay out of the docs page, where all examples share one document.
export const StartsDark: Story = {
	tags: ["!autodocs"],
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