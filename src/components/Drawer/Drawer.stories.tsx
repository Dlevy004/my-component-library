import { StrictMode, useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Canvas,
	Controls,
	Description,
	Stories,
	Title,
} from "@storybook/addon-docs/blocks";
import { expect, fn, waitFor } from "storybook/test";
import { Drawer, type DrawerProps } from "./Drawer";
import componentSource from "./Drawer.tsx?raw";

const description = [
	"A panel that slides in from the left or right edge, for mobile navigation or side content. It is built on the native `<dialog>` element, so Esc, focus trapping and blocking the page behind it come from the browser.",
	"",
	"**Requirements**",
	"- React 18+, `pnpm add lucide-react`, Tailwind CSS v4 with a class-based dark variant (`@custom-variant dark (&:where(.dark, .dark *));`)",
	"",
	"**Good to know**",
	"- It is controlled: set `open` to false in `onClose`, which fires for the close button, the Esc key and clicks on the backdrop.",
	"- Closing waits for the slide-out (300 ms, instant with reduced motion).",
	"- Page scroll is locked while it is open and restored afterwards.",
	"- Put your own `<nav aria-label=\"...\">` inside for navigation links.",
	"- Open it with `HamburgerButton`, pass the drawer's `id` as its `controls`."
].join("\n");

const content = (
	<nav
		aria-label="Demo navigation"
		className="flex flex-col items-end gap-4 text-lg"
	>
		<a href="#home">Home</a>
		<a href="#about">About</a>
		<a href="#contact">Contact</a>
	</nav>
);

const contentHu = (
	<nav
		aria-label="Demó navigáció"
		className="flex flex-col items-end gap-4 text-lg"
	>
		<a href="#home">Főoldal</a>
		<a href="#about">Rólunk</a>
		<a href="#contact">Kapcsolat</a>
	</nav>
);

// The demo button which opens the drawer, so the stories can show how to use it.
function DrawerDemo({
	buttonLabel = "Open drawer",
	...args
}: DrawerProps & { readonly buttonLabel?: string }) {
	const [open, setOpen] = useState(args.open);

	return (
		<>
            <div className="flex justify-center p-6">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white"
                >
                    {buttonLabel}
                </button>
            </div>
			<Drawer
				{...args}
				open={open}
				onClose={() => {
					args.onClose();
					setOpen(false);
				}}
			/>
		</>
	);
}

// The top block shows the full component source, the stories show usage snippets
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
	title: "Components/Navigation/Drawer",
	component: Drawer,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			page: DocsPage,
			description: { component: description },
			source: {
				// show usage of <Drawer>, not of the demo wrapper
				transform: (code: string) =>
					code
						.replaceAll("<DrawerDemo", "<Drawer")
						.replaceAll("</DrawerDemo>", "</Drawer>")
						.replaceAll(/\n\s*(key|buttonLabel)="[^"]*"/g, ""),
			},
		},
	},
	args: { open: false, onClose: fn(), children: content },
	argTypes: {
		children: { control: false },
		accentColor: { control: "color" },
		accentColorDark: { control: "color" },
	},
	render: (args) => <DrawerDemo key={String(args.open)} {...args} />,
	beforeEach: () => {
		document.body.style.overflow = "";
	},
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FromLeft: Story = {
	args: { side: "left" },
};

export const Localized: Story = {
	args: {
		label: "Mobil navigáció",
		closeLabel: "Menü bezárása",
		children: contentHu,
	},
	render: (args) => (
		<DrawerDemo
			key={String(args.open)}
			buttonLabel="Menü megnyitása"
			{...args}
		/>
	),
};

export const OpenOnLoad: Story = {
	tags: ["!autodocs"],
	args: { open: true },
};

export const OpensFromButton: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
		await userEvent.click(
			await canvas.findByRole("button", { name: "Open drawer" }),
		);
		const dialog = await canvas.findByRole("dialog", { name: "Menu" });
		await waitFor(() => expect(dialog).toHaveAttribute("data-shown"));
		await expect(dialog).toHaveAttribute("open");
		await expect(document.body.style.overflow).toBe("hidden");
	},
};

export const ClosesWithButton: Story = {
	tags: ["!dev", "!autodocs"],
	args: { open: true },
	play: async ({ canvas, userEvent, args }) => {
		const dialog = await canvas.findByRole("dialog", { name: "Menu" });
		await userEvent.click(canvas.getByRole("button", { name: "Close menu" }));
		await expect(args.onClose).toHaveBeenCalledOnce();
		await waitFor(() => expect(dialog).not.toHaveAttribute("open"), {
			timeout: 2000,
		});
		await expect(document.body.style.overflow).toBe("");
	},
};

export const ClosesOnEscape: Story = {
	tags: ["!dev", "!autodocs"],
	args: { open: true },
	play: async ({ canvas, args }) => {
		const dialog = await canvas.findByRole("dialog", { name: "Menu" });
		// Synthetic key presses cannot trigger the browser's own Esc handling,
		// so dispatch the event the browser would send
		const cancel = new Event("cancel", { cancelable: true });
		dialog.dispatchEvent(cancel);
		await expect(cancel.defaultPrevented).toBe(true);
		await expect(args.onClose).toHaveBeenCalledOnce();
		await waitFor(() => expect(dialog).not.toHaveAttribute("open"), {
			timeout: 2000,
		});
	},
};

export const ClosesOnBackdropClick: Story = {
	tags: ["!dev", "!autodocs"],
	args: { open: true },
	play: async ({ canvas, userEvent, args }) => {
		const dialog = await canvas.findByRole("dialog", { name: "Menu" });

		// a click inside the content must not close it
		await userEvent.click(canvas.getByRole("navigation"));
		await expect(args.onClose).not.toHaveBeenCalled();

		// a click on the dialog element itself is a click on the backdrop
		dialog.click();
		await expect(args.onClose).toHaveBeenCalledOnce();
		await waitFor(() => expect(dialog).not.toHaveAttribute("open"), {
			timeout: 2000,
		});
	},
};

export const ClosesInstantlyWithReducedMotion: Story = {
	tags: ["!dev", "!autodocs"],
	args: { open: true },
	beforeEach: mockReducedMotion,
	play: async ({ canvas, userEvent }) => {
		const dialog = await canvas.findByRole("dialog", { name: "Menu" });
		await userEvent.click(canvas.getByRole("button", { name: "Close menu" }));
		await waitFor(() => expect(dialog).not.toHaveAttribute("open"), {
			timeout: 200,
		});
	},
};

export const SurvivesStrictMode: Story = {
	tags: ["!dev", "!autodocs"],
	args: { open: true },
	decorators: [
		(Story) => (
			<StrictMode>
				<Story />
			</StrictMode>
		),
	],
	play: async ({ canvas }) => {
		const dialog = await canvas.findByRole("dialog", { name: "Menu" });
		await expect(dialog).toHaveAttribute("open");
		await waitFor(() => expect(dialog).toHaveAttribute("data-shown"));
	},
};

// closes after 50 ms and reopens after 150 ms, while the slide-out is still running
function ReopenDemo(args: DrawerProps) {
	const [open, setOpen] = useState(true);

	useEffect(() => {
		const close = setTimeout(() => setOpen(false), 50);
		const reopen = setTimeout(() => setOpen(true), 150);
		return () => {
			clearTimeout(close);
			clearTimeout(reopen);
		};
	}, []);

	return <Drawer {...args} open={open} />;
}

export const ReopensDuringSlideOut: Story = {
	tags: ["!dev", "!autodocs"],
	render: (args) => <ReopenDemo {...args} />,
	play: async ({ canvas }) => {
		const dialog = await canvas.findByRole("dialog", { name: "Menu" });
		// wait past the moment the first close would have finished (50 + 300 ms)
		await new Promise((resolve) => setTimeout(resolve, 500));
		await expect(dialog).toHaveAttribute("open");
		await expect(dialog).toHaveAttribute("data-shown");
	},
};