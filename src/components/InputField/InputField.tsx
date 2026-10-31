"use client";

import { useId, type CSSProperties } from "react";
import Select from "react-select";

export interface InputFieldOption {
	/** Value passed to onChange when the option is chosen */
	readonly value: string;
	/** Text of the option */
	readonly label: string;
}

export type InputFieldType =
	| "text"
	| "email"
	| "tel"
	| "password"
	| "number"
	| "url"
	| "search"
	| "date"
	| "textarea"
	| "select";

export interface InputFieldProps {
	/** Label of the field. It is also the accessible name, so it is always required */
	readonly label: string;
	/** Current value. For a dropdown, the `value` of the selected option */
	readonly value: string;
	/** Called with the new value (not an event) whenever it changes */
	readonly onChange: (value: string) => void;
	/** Kind of field: a native input type, "textarea" or "select" (a searchable dropdown) */
	readonly type?: InputFieldType;
	/** Hint shown while the field is empty. It does not replace the label */
	readonly placeholder?: string;
	/** Regular expression the value must match (native inputs only, checked when a form is submitted) */
	readonly pattern?: string;
	/** Marks the field as required for native form validation. It adds no asterisk */
	readonly required?: boolean;
	/** Disables the field */
	readonly disabled?: boolean;
	/** Name of the field in a native form. A dropdown renders a hidden input with this name */
	readonly name?: string;
	/** Error message shown below the field. The field gets a red border and is marked invalid */
	readonly error?: string;
	/** Choices of a dropdown (`type="select"`) */
	readonly options?: readonly InputFieldOption[];
	/** Visible rows of a textarea */
	readonly rows?: number;
	/** Hide the label visually. Screen readers still read it */
	readonly hideLabel?: boolean;
	/** Message of a dropdown when no option matches the typed text */
	readonly noOptionsText?: string;
	/** Accent color of the focus outline and the selected dropdown option. The selected text is white, so pick a color with at least 4.5:1 contrast against white */
	readonly accentColor?: string;
	/** Accent color in dark mode. The selected text is dark, so pick a light color */
	readonly accentColorDark?: string;
	/** Extra classes for the whole field, e.g. to limit the width */
	readonly className?: string;
}

const NATIVE_FOCUS =
	"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--field-accent) dark:focus-visible:outline-(--field-accent-dark)";
const SELECT_FOCUS =
	"outline-2 outline-offset-2 outline-(--field-accent) dark:outline-(--field-accent-dark)";

export function InputField({
	label,
	value,
	onChange,
	type = "text",
	placeholder,
	pattern,
	required,
	disabled,
	name,
	error,
	options = [],
	rows = 4,
	hideLabel = false,
	noOptionsText = "No options",
	accentColor = "#2563eb",
	accentColorDark = "#60a5fa",
	className = "",
}: InputFieldProps) {
	const inputId = useId();
	const errorId = `${inputId}-error`;
	const describedBy = error ? errorId : undefined;
	const invalid = Boolean(error);

	const border = error
		? "border-red-700 dark:border-red-400"
		: "border-transparent";
	const surface = `w-full rounded-[11px] border-2 bg-neutral-200 text-neutral-900 shadow-[inset_0_0_10px_0_rgba(0,0,0,0.2)] dark:bg-neutral-800 dark:text-neutral-100 ${border}`;
	const native = `${surface} p-[0.7rem] placeholder:text-neutral-600 disabled:cursor-not-allowed dark:placeholder:text-neutral-400 ${NATIVE_FOCUS}`;

	let field;
	if (type === "textarea") {
		field = (
			<textarea
				id={inputId}
				name={name}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				required={required}
				disabled={disabled}
				rows={rows}
				aria-invalid={invalid}
				aria-describedby={describedBy}
				className={`${native} resize-none`}
			/>
		);
	} else if (type === "select") {
		field = (
			<Select<InputFieldOption>
				unstyled
				inputId={inputId}
				name={name}
				options={options}
				value={options.find((option) => option.value === value) ?? null}
				// never null: the dropdown cannot be cleared
				onChange={(selected) => onChange(selected!.value)}
				placeholder={placeholder}
				required={required}
				isDisabled={disabled}
				isClearable={false}
				noOptionsMessage={() => noOptionsText}
				aria-invalid={invalid}
				aria-errormessage={describedBy}
				classNames={{
					container: () => "w-full",
					control: ({ isFocused }) =>
						`${surface} flex min-h-[42px] cursor-pointer items-center px-1.5 py-[0.15rem] ${isFocused ? SELECT_FOCUS : ""}`,
					valueContainer: () => "gap-1 px-1.5",
					singleValue: () => "truncate",
					placeholder: () => "text-neutral-600 dark:text-neutral-400",
					input: () => "text-neutral-900 dark:text-neutral-100",
					dropdownIndicator: () => "px-2 text-neutral-600 dark:text-neutral-400",
					menu: () =>
						"z-20 mt-1 overflow-hidden rounded-[11px] bg-neutral-100 text-neutral-900 shadow-lg dark:bg-neutral-800 dark:text-neutral-100",
					menuList: () => "max-h-[220px] overflow-y-auto",
					noOptionsMessage: () =>
						"px-3 py-2 text-neutral-600 dark:text-neutral-400",
					option: ({ isSelected, isFocused }) =>
						`cursor-pointer truncate px-3 py-2 ${
							isSelected
								? "bg-(--field-accent) text-white dark:bg-(--field-accent-dark) dark:text-neutral-900"
								: isFocused
									? "bg-black/5 dark:bg-white/10"
									: ""
						}`,
				}}
			/>
		);
	} else {
		field = (
			<input
				id={inputId}
				name={name}
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				pattern={pattern}
				required={required}
				disabled={disabled}
				aria-invalid={invalid}
				aria-describedby={describedBy}
				className={native}
			/>
		);
	}

	return (
		<div
			style={
				{
					"--field-accent": accentColor,
					"--field-accent-dark": accentColorDark,
				} as CSSProperties
			}
			className={`flex w-full flex-col items-start justify-center gap-[5px] ${disabled ? "opacity-60" : ""} ${className}`}
		>
			<label htmlFor={inputId} className={hideLabel ? "sr-only" : ""}>
				{label}
			</label>

			{field}

			{error && (
				<span
					id={errorId}
					className="text-xs font-bold text-red-700 dark:text-red-400"
				>
					{error}
				</span>
			)}
		</div>
	);
}