import { useState } from "react";
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
import { expect, fn, waitFor } from "storybook/test";
import { SegmentedControl, type SegmentedControlProps } from "./SegmentedControl";
import componentSource from "./SegmentedControl.tsx?raw";

const description = [
	"A row of options where exactly one is selected, and a highlight slides to the chosen one. Use it for a short, either-or choice in a form.",
	"",
	"**Requirements**",
	"- React 18+, Tailwind CSS v4 with a class-based dark variant (`@custom-variant dark (&:where(.dark, .dark *));`)",
	"",
	"**Good to know**",
	"- It is controlled: keep the selected value in state, pass it as `value` and update it in `onChange`.",
	"- Any number of options works, the highlight adapts. Each option needs a unique `value`.",
	"- It follows the radio group pattern: one Tab stop, the arrow keys, Home and End change the selection (and wrap around), and the focus moves with it.",
	"- Choosing the option that is already selected does nothing, `onChange` is only called for a change.",
	"- If `value` matches no option, nothing is highlighted and the first option is the Tab stop.",
	"- The label is always visible and names the group for screen readers.",
	"- It renders no form field. To send the value with a native form, add a hidden input with the same value.",
	"- The selected text is white in light mode and dark in dark mode, so choose `accentColor` with at least 4.5:1 contrast against white and a light `accentColorDark`.",
	"- It fills the width of its parent. Limit it with a wrapper or `className`.",
].join("\n");

const usageImport = `import { SegmentedControl } from "./components/SegmentedControl/SegmentedControl";`;

const usageSnippet = `import { useState } from "react";
import { SegmentedControl } from "./components/SegmentedControl/SegmentedControl";

export function ClientTypePicker() {
	const [clientType, setClientType] = useState("individual");

	return (
		<SegmentedControl
			label="Client type"
			options={[
				{ value: "individual", label: "Individual" },
				{ value: "company", label: "Company" },
			]}
			value={clientType}
			onChange={setClientType}
		/>
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

const clientTypes = [
	{ value: "individual", label: "Individual" },
	{ value: "company", label: "Company" },
];

const periods = [
	{ value: "day", label: "Day" },
	{ value: "week", label: "Week" },
	{ value: "month", label: "Month" },
];

// The component is controlled, so the demo keeps the selection in state
function ControlledDemo(args: SegmentedControlProps) {
	const [value, setValue] = useState(args.value);

	return (
		<SegmentedControl
			{...args}
			value={value}
			onChange={(next) => {
				setValue(next);
				args.onChange(next);
			}}
		/>
	);
}

const radio = (canvas: { getByRole: (role: string, options: object) => HTMLElement }, name: string) =>
	canvas.getByRole("radio", { name });

const meta = {
	title: "Components/Forms/SegmentedControl",
	component: SegmentedControl,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			page: DocsPage,
			description: { component: description },
			source: {
				// show usage of <SegmentedControl>, not of the demo wrapper
				transform: (code: string) =>
					code.trimStart().startsWith("<")
						? `${usageImport}\n\n${code
								.replace(/<ControlledDemo/g, "<SegmentedControl")
								.replace(/\n\s*key="[^"]*"/g, "")
								.replace("onChange={() => {}}", "onChange={setValue}")}`
						: code,
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="w-80 text-neutral-900 dark:text-neutral-100">
				<Story />
			</div>
		),
	],
	args: {
		label: "Client type",
		options: clientTypes,
		value: "individual",
		onChange: fn(),
	},
	argTypes: {
		onChange: { control: false },
		accentColor: { control: "color" },
		accentColorDark: { control: "color" },
		options: { control: "object" },
	},
	render: (args) => <ControlledDemo key={args.value} {...args} />,
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: { source: { type: "code", language: "tsx", code: usageSnippet } },
	},
};

export const Localized: Story = {
	args: {
		label: "Ügyfél típusa",
		options: [
			{ value: "individual", label: "Magánszemély" },
			{ value: "company", label: "Cég" },
		],
	},
};

export const ThreeOptions: Story = {
	args: { label: "Period", options: periods, value: "week" },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const indicator = canvasElement.querySelector<HTMLElement>("[data-indicator]")!;
		await expect(indicator.style.getPropertyValue("--seg-index")).toBe("1");

		await userEvent.click(radio(canvas, "Month"));
		await waitFor(() =>
			expect(indicator.style.getPropertyValue("--seg-index")).toBe("2"),
		);
	},
};

export const ClickSelects: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas, userEvent, args }) => {
		const group = await canvas.findByRole("radiogroup", { name: "Client type" });
		await expect(group).toBeInTheDocument();
		const individual = radio(canvas, "Individual");
		const company = radio(canvas, "Company");
		await expect(individual).toHaveAttribute("aria-checked", "true");

		await userEvent.click(company);
		await waitFor(() => expect(company).toHaveAttribute("aria-checked", "true"));
		await expect(individual).toHaveAttribute("aria-checked", "false");
		await expect(args.onChange).toHaveBeenCalledOnce();
		await expect(args.onChange).toHaveBeenLastCalledWith("company");

		// choosing the selected option again changes nothing
		await userEvent.click(company);
		await expect(args.onChange).toHaveBeenCalledOnce();

		await userEvent.click(individual);
		await waitFor(() => expect(individual).toHaveAttribute("aria-checked", "true"));
		await expect(args.onChange).toHaveBeenCalledTimes(2);
	},
};

export const KeyboardNavigation: Story = {
	tags: ["!dev", "!autodocs"],
	args: { label: "Period", options: periods, value: "week" },
	play: async ({ canvas, userEvent, args }) => {
		await canvas.findByRole("radiogroup", { name: "Period" });
		const day = radio(canvas, "Day");
		const week = radio(canvas, "Week");
		const month = radio(canvas, "Month");

		// only the selected option is a Tab stop
		await expect(week).toHaveAttribute("tabindex", "0");
		await expect(day).toHaveAttribute("tabindex", "-1");
		await expect(month).toHaveAttribute("tabindex", "-1");

		const pressAndExpect = async (key: string, expected: HTMLElement) => {
			await userEvent.keyboard(key);
			await waitFor(() => expect(expected).toHaveAttribute("aria-checked", "true"));
			await expect(expected).toHaveFocus();
		};

		week.focus();
		await pressAndExpect("{ArrowRight}", month);
		await pressAndExpect("{ArrowRight}", day); // wraps around
		await pressAndExpect("{ArrowLeft}", month); // wraps around
		await pressAndExpect("{ArrowLeft}", week);
		await pressAndExpect("{Home}", day);
		await pressAndExpect("{End}", month);
		await pressAndExpect("{ArrowUp}", week);
		await pressAndExpect("{ArrowDown}", month);
		await expect(args.onChange).toHaveBeenCalledTimes(8);

		// other keys do nothing
		await userEvent.keyboard("a");
		await expect(month).toHaveAttribute("aria-checked", "true");
		await expect(args.onChange).toHaveBeenCalledTimes(8);
	},
};

export const NothingSelected: Story = {
	tags: ["!dev", "!autodocs"],
	args: { value: "" },
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await canvas.findByRole("radiogroup", { name: "Client type" });
		const individual = radio(canvas, "Individual");
		const company = radio(canvas, "Company");

		await expect(individual).toHaveAttribute("aria-checked", "false");
		await expect(company).toHaveAttribute("aria-checked", "false");
		await expect(canvasElement.querySelector("[data-indicator]")).toBeNull();

		// the first option is the Tab stop, and the arrows work from there
		await expect(individual).toHaveAttribute("tabindex", "0");
		await expect(company).toHaveAttribute("tabindex", "-1");
		individual.focus();
		await userEvent.keyboard("{ArrowRight}");
		await waitFor(() => expect(company).toHaveAttribute("aria-checked", "true"));
		await expect(args.onChange).toHaveBeenLastCalledWith("company");
	},
};