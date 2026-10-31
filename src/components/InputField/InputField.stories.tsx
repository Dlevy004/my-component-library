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
import { expect, fn, waitFor } from "storybook/test";
import { InputField, type InputFieldProps } from "./InputField";
import componentSource from "./InputField.tsx?raw";

const description = [
	"A form field with a label, an error message and three kinds of input: a native input (text, email, phone and more), a textarea and a searchable dropdown built with react-select. All of them share the same props and look.",
	"",
	"**Requirements**",
	"- React 18+, `pnpm add react-select` (5.7 or newer), Tailwind CSS v4 with a class-based dark variant (`@custom-variant dark (&:where(.dark, .dark *));`)",
	"",
	"**Good to know**",
	"- It is controlled: keep the value in state and update it in `onChange`. `onChange` receives the new value as a string for every type, including the dropdown, not an event.",
	"- `type=\"select\"` needs `options` (`{ value, label }`). Users can type to filter them. A `value` that matches no option shows the placeholder.",
	"- The `label` is required, because it names the field for screen readers. `hideLabel` hides it visually but keeps it. A placeholder is no replacement for a label.",
	"- `error` shows the message below the field, turns the border red and marks the field invalid. It does not validate anything: you decide when to pass an error.",
	"- `required` and `pattern` are native form validation. They take effect when a form is submitted and add no asterisk to the label.",
	"- Use `name` to send the field with a native form. The dropdown renders a hidden input with that name.",
	"- The dropdown's built-in texts: `placeholder` and `noOptionsText`. react-select's screen reader announcements stay in English.",
	"- The dropdown menu opens below the field and overlaps the content under it. Do not put the field in an element with `overflow: hidden`, or the menu is clipped.",
	"- The field fills the width of its parent. Limit it with a wrapper or `className`.",
	"- react-select brings its own styling runtime (emotion) into your bundle, even though its default styles are turned off here.",
].join("\n");

const usageImport = `import { InputField } from "./components/InputField/InputField";`;

const usageSnippet = `import { useState } from "react";
import { InputField } from "./components/InputField/InputField";

export function ClientForm() {
	const [name, setName] = useState("");
	const [type, setType] = useState("individual");
	const [notes, setNotes] = useState("");

	return (
		<form className="flex flex-col gap-4">
			<InputField
				label="Full name"
				value={name}
				onChange={setName}
				placeholder="Jane Doe"
				required
				error={name === "" ? "Enter a name" : undefined}
			/>
			<InputField
				label="Client type"
				type="select"
				options={[
					{ value: "individual", label: "Individual" },
					{ value: "company", label: "Company" },
				]}
				value={type}
				onChange={setType}
			/>
			<InputField label="Notes" type="textarea" value={notes} onChange={setNotes} />
		</form>
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
	{ value: "nonprofit", label: "Non-profit" },
];

const clientTypesHu = [
	{ value: "individual", label: "Magánszemély" },
	{ value: "company", label: "Cég" },
	{ value: "nonprofit", label: "Civil szervezet" },
];

const dropdownArgs = {
	label: "Client type",
	type: "select",
	options: clientTypes,
	value: "individual",
} as const;

// The component is controlled, so the demo keeps the value in state
function ControlledDemo(args: InputFieldProps) {
	const [value, setValue] = useState(args.value);

	return (
		<InputField
			{...args}
			value={value}
			onChange={(next) => {
				setValue(next);
				args.onChange(next);
			}}
		/>
	);
}

// The dropdown menu overlaps what is below it, so leave room for it in the docs
const withMenuRoom = [
	(Story: () => ReactNode) => (
		<div className="pb-44">
			<Story />
		</div>
	),
];

const meta = {
	title: "Components/Forms/InputField",
	component: InputField,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			page: DocsPage,
			description: { component: description },
			source: {
				// show usage of <InputField>, not of the demo wrapper
				transform: (code: string) =>
					code.trimStart().startsWith("<")
						? `${usageImport}\n\n${code
								.replaceAll("<ControlledDemo", "<InputField")
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
		label: "Full name",
		value: "",
		placeholder: "Jane Doe",
		onChange: fn(),
	},
	argTypes: {
		onChange: { control: false },
		options: { control: "object" },
		type: {
			control: "select",
			options: [
				"text",
				"email",
				"tel",
				"password",
				"number",
				"url",
				"search",
				"date",
				"textarea",
				"select",
			],
		},
		accentColor: { control: "color" },
		accentColorDark: { control: "color" },
	},
	render: (args) => <ControlledDemo key={args.value} {...args} />,
} satisfies Meta<typeof InputField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: { source: { type: "code", language: "tsx", code: usageSnippet } },
	},
	play: async ({ canvas }) => {
		const input = await canvas.findByLabelText("Full name");
		await expect(input).toHaveAttribute("aria-invalid", "false");
		await expect(input).not.toHaveAttribute("aria-describedby");
	},
};

export const Localized: Story = {
	args: { label: "Ügyfél neve", placeholder: "Kovács János" },
};

export const Textarea: Story = {
	args: {
		label: "Notes",
		type: "textarea",
		placeholder: "Anything we should know?",
	},
};

export const Dropdown: Story = {
	args: dropdownArgs,
	decorators: withMenuRoom,
};

export const LocalizedDropdown: Story = {
	args: {
		label: "Ügyfél típusa",
		type: "select",
		options: clientTypesHu,
		value: "",
		placeholder: "Válassz...",
	},
	decorators: withMenuRoom,
};

export const WithError: Story = {
	args: {
		label: "Email",
		type: "email",
		value: "jane@",
		error: "Enter a valid email address",
	},
	play: async ({ canvas }) => {
		const input = await canvas.findByLabelText("Email");
		await expect(input).toHaveAttribute("aria-invalid", "true");
		const message = canvas.getByText("Enter a valid email address");
		await expect(input).toHaveAttribute("aria-describedby", message.id);
	},
};

export const HiddenLabel: Story = {
	args: { label: "City", hideLabel: true, placeholder: "City" },
	play: async ({ canvas }) => {
		// the label is hidden visually, but still names the field
		const input = await canvas.findByLabelText("City");
		await expect(input).toBeInTheDocument();
		await expect(canvas.getByText("City", { selector: "label" })).toHaveClass(
			"sr-only",
		);
	},
};

export const Disabled: Story = {
	args: { value: "Jane Doe", disabled: true },
	play: async ({ canvas }) => {
		await expect(await canvas.findByLabelText("Full name")).toBeDisabled();
	},
};

export const TypingCallsOnChange: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas, userEvent, args }) => {
		const input = await canvas.findByLabelText("Full name");
		await userEvent.type(input, "Jane");
		await expect(input).toHaveValue("Jane");
		await expect(args.onChange).toHaveBeenLastCalledWith("Jane");
	},
};

export const TextareaCallsOnChange: Story = {
	tags: ["!dev", "!autodocs"],
	args: { label: "Notes", type: "textarea", rows: 6 },
	play: async ({ canvas, userEvent, args }) => {
		const textarea = await canvas.findByLabelText("Notes");
		await expect(textarea).toHaveAttribute("rows", "6");
		await userEvent.type(textarea, "Call back");
		await expect(textarea).toHaveValue("Call back");
		await expect(args.onChange).toHaveBeenLastCalledWith("Call back");
	},
};

export const RequiredField: Story = {
	tags: ["!dev", "!autodocs"],
	args: { required: true, name: "full_name" },
	play: async ({ canvas }) => {
		const input = await canvas.findByLabelText("Full name");
		await expect(input).toBeRequired();
		await expect(input).toHaveAttribute("name", "full_name");
	},
};

export const DropdownPicksOption: Story = {
	tags: ["!dev", "!autodocs"],
	args: dropdownArgs,
	play: async ({ canvas, userEvent, args }) => {
		const combobox = await canvas.findByRole("combobox", { name: "Client type" });
		await userEvent.click(combobox);
		await userEvent.click(await canvas.findByText("Company"));

		await waitFor(() =>
			expect(args.onChange).toHaveBeenLastCalledWith("company"),
		);
		// the menu closed and the choice is shown
		await expect(canvas.queryByText("Non-profit")).not.toBeInTheDocument();
		await expect(canvas.getByText("Company")).toBeInTheDocument();
	},
};

export const DropdownKeyboard: Story = {
	tags: ["!dev", "!autodocs"],
	args: dropdownArgs,
	play: async ({ canvas, userEvent, args }) => {
		const combobox = await canvas.findByRole("combobox", { name: "Client type" });
		combobox.focus();

		await userEvent.keyboard("{ArrowDown}"); // opens the menu
		await canvas.findByText("Company");
		await userEvent.keyboard("{ArrowDown}"); // moves to the next option
		await userEvent.keyboard("{Enter}");

		await waitFor(() =>
			expect(args.onChange).toHaveBeenLastCalledWith("company"),
		);
	},
};

export const DropdownWithoutMatch: Story = {
	tags: ["!dev", "!autodocs"],
	args: { ...dropdownArgs, value: "missing" },
	play: async ({ canvas }) => {
		// a value that matches no option shows the placeholder
		await expect(await canvas.findByText("Select...")).toBeInTheDocument();
	},
};

export const DropdownWithoutOptions: Story = {
	tags: ["!dev", "!autodocs"],
	args: { ...dropdownArgs, options: [], value: "" },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(
			await canvas.findByRole("combobox", { name: "Client type" }),
		);
		await expect(await canvas.findByText("No options")).toBeInTheDocument();
	},
};

export const ErrorOnTextarea: Story = {
	tags: ["!dev", "!autodocs"],
	args: { label: "Notes", type: "textarea", error: "Notes are too short" },
	play: async ({ canvas }) => {
		const textarea = await canvas.findByLabelText("Notes");
		await expect(textarea).toHaveAttribute("aria-invalid", "true");
		const message = canvas.getByText("Notes are too short");
		await expect(textarea).toHaveAttribute("aria-describedby", message.id);
	},
};

export const ErrorOnDropdown: Story = {
	tags: ["!dev", "!autodocs"],
	args: { ...dropdownArgs, value: "", error: "Choose a client type" },
	play: async ({ canvas }) => {
		const combobox = await canvas.findByRole("combobox", { name: "Client type" });
		await expect(combobox).toHaveAttribute("aria-invalid", "true");
		const message = canvas.getByText("Choose a client type");
		await expect(combobox).toHaveAttribute("aria-errormessage", message.id);
	},
};

export const DisabledDropdown: Story = {
	tags: ["!dev", "!autodocs"],
	args: { ...dropdownArgs, disabled: true },
	play: async ({ canvas }) => {
		await expect(
			await canvas.findByRole("combobox", { name: "Client type" }),
		).toBeDisabled();
	},
};