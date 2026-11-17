"use client";

import {
	useId,
	useState,
	type ChangeEvent,
	type CSSProperties,
	type DragEvent,
} from "react";
import { Plus } from "lucide-react";

export interface DragAndDropProps {
	/** Called with the chosen file, picked in the file dialog or dropped on the zone. Only called for files that match `accept` */
	readonly onFileSelect: (file: File) => void;
	/** Called with a dropped or chosen file that does not match `accept` */
	readonly onReject?: (file: File) => void;
	/** URL of the image to show instead of the prompt, e.g. made with `URL.createObjectURL(file)` */
	readonly previewUrl?: string;
	/** Accepted files, like the `accept` attribute of a file input: extensions (`.png`), types (`image/png`) or groups (`image/*`), separated by commas. Empty accepts any file */
	readonly accept?: string;
	/** Prompt shown while there is no preview */
	readonly label?: string;
	/** Alternative text of the preview image */
	readonly previewAlt?: string;
	/** Text for screen readers while a preview is shown, so they know the image can be replaced */
	readonly replaceLabel?: string;
	/** Error message shown below the zone. The border turns red and the field is marked invalid */
	readonly error?: string;
	/** Disables choosing and dropping files */
	readonly disabled?: boolean;
	/** Largest width of the zone as a CSS length. Use "100%" to fill the parent */
	readonly maxWidth?: string;
	/** Accent color of the border, the fill and the focus outline */
	readonly accentColor?: string;
	/** Accent color in dark mode */
	readonly accentColorDark?: string;
	/** Extra classes for the whole field */
	readonly className?: string;
}

// Same rules as the accept attribute of a file input
function matchesAccept(file: File, accept: string) {
	const rules = accept
		.split(",")
		.map((rule) => rule.trim().toLowerCase())
		.filter(Boolean);
	if (rules.length === 0) return true;

	const name = file.name.toLowerCase();
	const type = file.type.toLowerCase();
	return rules.some((rule) => {
		if (rule.startsWith(".")) return name.endsWith(rule);
		if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
		return type === rule;
	});
}

export function DragAndDrop({
	onFileSelect,
	onReject,
	previewUrl,
	accept = "image/*",
	label = "Drag an image here or click to upload",
	previewAlt = "Preview of the uploaded image",
	replaceLabel = "Click or drop an image to replace it",
	error,
	disabled,
	maxWidth = "350px",
	accentColor = "#2563eb",
	accentColorDark = "#60a5fa",
	className = "",
}: DragAndDropProps) {
	const errorId = `${useId()}-error`;
	const [dragging, setDragging] = useState(false);

	const handleFile = (file: File) => {
		if (matchesAccept(file, accept)) onFileSelect(file);
		else onReject?.(file);
	};

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files![0]; // a file input always has a list
		event.target.value = ""; // so choosing the same file again is noticed
		if (file) handleFile(file);
	};

	const handleDragEnter = () => {
		if (!disabled) setDragging(true);
	};

	const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
		event.preventDefault(); // without this the drop is not allowed
		event.dataTransfer.dropEffect = disabled ? "none" : "copy";
	};

	const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
		event.preventDefault(); // otherwise the browser opens the file
		setDragging(false);
		const file = event.dataTransfer.files[0]; // only the first file is used
		if (!disabled && file) handleFile(file);
	};

	const border = error
		? "border-red-700 dark:border-red-400"
		: "border-(--dnd-accent) dark:border-(--dnd-accent-dark)";

	return (
		<div
			style={
				{
					"--dnd-accent": accentColor,
					"--dnd-accent-dark": accentColorDark,
					"--dnd-max": maxWidth,
				} as CSSProperties
			}
			className={`flex w-full max-w-(--dnd-max) flex-col gap-1.5 ${className}`}
		>
			<label
				data-dragging={dragging ? "" : undefined}
				onDragEnter={handleDragEnter}
				onDragOver={handleDragOver}
				onDragLeave={() => setDragging(false)}
				onDrop={handleDrop}
				className={`relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-[clamp(0.5rem,4cqw,1rem)] overflow-hidden rounded-2xl border-2 border-dashed bg-(--dnd-accent)/10 p-4 text-neutral-900 transition-colors duration-200 [container-type:inline-size] *:pointer-events-none has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--dnd-accent) data-dragging:bg-(--dnd-accent)/25 motion-reduce:transition-none dark:bg-(--dnd-accent-dark)/15 dark:text-neutral-100 dark:has-[:focus-visible]:outline-(--dnd-accent-dark) dark:data-dragging:bg-(--dnd-accent-dark)/30 ${border}`}
			>
				{previewUrl ? (
					<>
						<img
							src={previewUrl}
							alt={previewAlt}
							className="absolute inset-0 size-full object-cover"
						/>
						<span className="sr-only">{replaceLabel}</span>
					</>
				) : (
					<>
						<Plus
							aria-hidden="true"
							className="size-[clamp(3rem,22cqw,5rem)] shrink-0"
						/>
						<span className="text-center text-[clamp(0.875rem,5.5cqw,1.125rem)] break-words">
							{label}
						</span>
					</>
				)}
				<input
					type="file"
					accept={accept}
					disabled={disabled}
					onChange={handleChange}
					aria-invalid={Boolean(error)}
					aria-describedby={error ? errorId : undefined}
					className="sr-only"
				/>
			</label>

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