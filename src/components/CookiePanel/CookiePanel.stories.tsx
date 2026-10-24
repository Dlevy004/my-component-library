import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { CookiePanel } from "./CookiePanel";
import componentSource from "./CookiePanel.tsx?raw";
import { Canvas, Controls, Description, Stories, Title } from "@storybook/addon-docs/blocks";

const description = [
	"A cookie consent dialog. It stores the visitor's choice in a cookie and calls `onAccept` / `onReject`, so your app decides what to load (e.g. analytics).",
	"",
	"**Requirements**",
	"- React 18+, `pnpm add lucide-react`, Tailwind CSS v4 with a class-based dark variant (`@custom-variant dark (&:where(.dark, .dark *));`)",
	"",
	"**Good to know**",
	"- The choice is stored in the `cookie_consent` cookie (`cookieName`): acceptance for 30 days (`maxAgeDays`), rejection for 7 days (`rejectMaxAgeDays`). After that the visitor is asked again.",
	"- `onAccept` is also called on return visits when a stored acceptance is found, so load your analytics there.",
	"- The panel is hidden during server rendering and slides up after mount, so there is no hydration mismatch.",
	"- Pick accent colors with at least 4.5:1 contrast on the panel background (`accentColor` for light, `accentColorDark` for dark mode).",
	"- The examples on this page share one cookie: accepting or rejecting in one hides all of them. Reload the page to see them again.",
].join("\n");

const usageImport = `import { CookiePanel } from "./components/CookiePanel/CookiePanel";`;

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
	title: "Components/Feedback/CookiePanel",
	component: CookiePanel,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: DocsPage,
			description: { component: description },
			source: {
				transform: (code: string) =>
					code.trimStart().startsWith("<")
						? `${usageImport}\n\n${code
								.replace(
									"onAccept={() => {}}",
									"onAccept={() => {\n\t\t// e.g. load your analytics script here\n\t}}",
								)
								.replace(
									"onReject={() => {}}",
									"onReject={() => {\n\t\t// optional\n\t}}",
								)}`
						: code,
			},
		},
	},
	decorators: [
		// In Docs, a transformed wrapper keeps the fixed panel inside the story box
		(Story, { viewMode }) =>
			viewMode === "docs" ? (
				<div style={{ transform: "translateZ(0)", height: 320 }}>
					<Story />
				</div>
			) : (
				<Story />
			),
	],
	args: { onAccept: fn(), onReject: fn() },
	argTypes: {
		accentColor: { control: "color" },
		accentColorDark: { control: "color" },
	},
	beforeEach: () => {
		document.cookie = "cookie_consent=; max-age=0; path=/";
	},
} satisfies Meta<typeof CookiePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Localized: Story = {
	args: {
		title: "Cookie tájékoztató",
		description: "Az oldal a jobb felhasználói élmény érdekében sütiket használ. További tudnivalók:",
		privacyLabel: "Adatkezelési tájékoztató",
		privacyHref: "/privacypolicy",
		acceptLabel: "Elfogad",
		rejectLabel: "Elutasít",
	},
	parameters: {
		docs: {
			source: {
				type: "code",
				language: "tsx",
				code:
				`import { CookiePanel } from './components/CookiePanel'

                <CookiePanel
					title="Cookie tájékoztató"
					description="Az oldal a jobb felhasználói élmény érdekében sütiket használ. További tudnivalók:"
					privacyLabel="Adatkezelési tájékoztató"
					privacyHref="/privacypolicy"
					acceptLabel="Elfogad"
					rejectLabel="Elutasít"
					onAccept={() => {
						// e.g. load your analytics script here
					}}
					onReject={() => {
						// optional
					}}
				/>`,
			},
		},
	},
};

export const AcceptHidesPanel: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(
			await canvas.findByRole("button", { name: "Accept" }),
		);
		await expect(args.onAccept).toHaveBeenCalledOnce();
		await waitFor(() =>
			expect(canvas.queryByRole("dialog")).not.toBeInTheDocument(),
		);
	},
};

export const RejectIsRemembered: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(
			await canvas.findByRole("button", { name: "Reject" }),
		);
		await expect(args.onReject).toHaveBeenCalledOnce();
		await expect(document.cookie).toContain("cookie_consent=rejected");
	},
};

export const StoredAcceptanceNotifiesHost: Story = {
	tags: ["!dev", "!autodocs"],
	beforeEach: () => {
		document.cookie = "cookie_consent=accepted; max-age=3600; path=/";
	},
	play: async ({ args }) => {
		await waitFor(() => expect(args.onAccept).toHaveBeenCalledOnce());
	},
};