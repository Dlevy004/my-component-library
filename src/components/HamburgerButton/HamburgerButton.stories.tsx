import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Canvas,
	Controls,
	Description,
	Stories,
	Title,
} from "@storybook/addon-docs/blocks";
import { expect, fn } from "storybook/test";
import { HamburgerButton } from "./HamburgerButton";
import componentSource from "./HamburgerButton.tsx?raw";

const description = [
	"A round icon button that opens a menu or drawer. Pair it with `Drawer`.",
	"",
	"**Requirements**",
	"- React 18+, `pnpm add lucide-react`, Tailwind CSS v4 with a class-based dark variant (`@custom-variant dark (&:where(.dark, .dark *));`)",
	"",
	"**Good to know**",
	"- It is visible on every screen size. Hide it where it is not needed, e.g. `className=\"lg:hidden\"`.",
	"- Pass `isOpen` and `controls` (the id of the menu) so screen readers know what the button does.",
	"- The icon is always white, so choose colors with at least 3:1 contrast against white."
].join("\n");

const usageImport = `import { HamburgerButton } from "./components/HamburgerButton/HamburgerButton";`;

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
	title: "Components/Navigation/HamburgerButton",
	component: HamburgerButton,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			page: DocsPage,
			description: { component: description },
			source: {
				transform: (code: string) =>
					code.trimStart().startsWith("<")
						? `${usageImport}\n\n${code.replace(
								"onClick={() => {}}",
								"onClick={() => setOpen(true)}",
							)}`
						: code,
			},
		},
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