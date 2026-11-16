import { useEffect, useState } from "react";
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
import { DragAndDrop, type DragAndDropProps } from "./DragAndDrop";
import componentSource from "./DragAndDrop.tsx?raw";

const description = [
	"A zone where the visitor drops an image or clicks to choose one, with an optional preview of the chosen image. It hands the file to your code and does nothing else: uploading it is up to you.",
	"",
	"**Requirements**",
	"- React 18+, `pnpm add lucide-react`, Tailwind CSS v4 with a class-based dark variant (`@custom-variant dark (&:where(.dark, .dark *));`)",
	"",
	"**Good to know**",
	"- `onFileSelect` receives a `File`. To show a preview, make a URL with `URL.createObjectURL(file)`, keep it in state and pass it as `previewUrl`. Revoke the old URL with `URL.revokeObjectURL` when it is replaced.",
	"- Files must match `accept` (images by default), both when chosen in the dialog and when dropped. Other files go to `onReject`, e.g. to show an `error`. An empty `accept` takes any file.",
	"- Only the first file is used when several are dropped or chosen.",
	"- The zone is square and fills its parent up to `maxWidth` (350px by default, \"100%\" to fill the parent). The icon and the text scale with the zone's width, so it works in narrow columns and on phones.",
	"- While a preview is shown, the whole zone still accepts a new file. Screen readers hear `replaceLabel`.",
	"- It is not a native form field: a dropped file is not added to the `<input type=\"file\">`, so use `onFileSelect` instead of a native form submit.",
	"- `error` shows a message below the zone and marks the field invalid. It validates nothing: you decide when to pass an error.",
	"- In dark mode the fill is tinted with `accentColorDark`. Pick colors with at least 3:1 contrast against the page for the border.",
	"- If your linter objects to drag handlers on the `label`, move them into an effect with `addEventListener`, as in the `Drawer`.",
].join("\n");

const usageImport = `import { DragAndDrop } from "./components/DragAndDrop/DragAndDrop";`;

const usageSnippet = `import { useState } from "react";
import { DragAndDrop } from "./components/DragAndDrop/DragAndDrop";

export function AvatarUpload() {
	const [previewUrl, setPreviewUrl] = useState<string>();
	const [error, setError] = useState<string>();

	return (
		<DragAndDrop
			previewUrl={previewUrl}
			error={error}
			onFileSelect={(file) => {
				if (previewUrl) URL.revokeObjectURL(previewUrl);
				setPreviewUrl(URL.createObjectURL(file));
				setError(undefined);
			}}
			onReject={() => setError("Please choose an image")}
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

const sampleImage = `data:image/svg+xml;utf8,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fec5fb"/><stop offset="1" stop-color="#00bae2"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/></svg>',
)}`;

// A 1x1 pixel PNG, enough to be a real image file
const PIXEL = Uint8Array.from(
	atob(
		"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
	),
	(char) => char.charCodeAt(0),
);

const imageFile = (name = "photo.png") =>
	new File([PIXEL], name, { type: "image/png" });
const textFile = (name = "notes.txt") =>
	new File(["hello"], name, { type: "text/plain" });

const transfer = (...files: File[]) => {
	const data = new DataTransfer();
	files.forEach((file) => data.items.add(file));
	return data;
};

// Sends a drag event to an element, like the browser does during a real drag
const drag = (element: Element, type: string, files: File[] = []) => {
	const dataTransfer = transfer(...files);
	const event = new DragEvent(type, {
		bubbles: true,
		cancelable: true,
		dataTransfer,
	});
	element.dispatchEvent(event);
	return { event, dataTransfer };
};

// Like drag(), but the transfer is a plain object. A real DataTransfer that was
// not made by an actual drag ignores changes to dropEffect, so it cannot be used
// to check which effect the component asks for.
const dragOver = (element: Element) => {
	const dataTransfer = { dropEffect: "none", files: [] as File[] };
	const event = new Event("dragover", { bubbles: true, cancelable: true });
	Object.defineProperty(event, "dataTransfer", { value: dataTransfer });
	element.dispatchEvent(event);
	return { event, dataTransfer };
};

const zone = (root: HTMLElement) => root.querySelector("label")!;
const fileInput = (root: HTMLElement) =>
	root.querySelector<HTMLInputElement>('input[type="file"]')!;

// The component only hands over the file, so the demo makes the preview
function PreviewDemo(args: DragAndDropProps) {
	const [previewUrl, setPreviewUrl] = useState(args.previewUrl);

	// give back the memory of a made-up preview URL when it is replaced or the demo goes away
	useEffect(
		() => () => {
			if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
		},
		[previewUrl],
	);

	return (
		<DragAndDrop
			{...args}
			previewUrl={previewUrl}
			onFileSelect={(file) => {
				setPreviewUrl(URL.createObjectURL(file));
				args.onFileSelect(file);
			}}
		/>
	);
}

const meta = {
	title: "Components/Forms/DragAndDrop",
	component: DragAndDrop,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			page: DocsPage,
			description: { component: description },
			source: {
				// show usage of <DragAndDrop>, not of the demo wrapper
				transform: (code: string) =>
					code.trimStart().startsWith("<")
						? `${usageImport}\n\n${code
								.replaceAll("<PreviewDemo", "<DragAndDrop")
								.replace(/\n\s*key="[^"]*"/g, "")
								.replace("onFileSelect={() => {}}", "onFileSelect={handleFile}")}`
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
	args: { onFileSelect: fn() },
	argTypes: {
		onFileSelect: { control: false },
		onReject: { control: false },
		accentColor: { control: "color" },
		accentColorDark: { control: "color" },
	},
	render: (args) => <PreviewDemo key={args.previewUrl ?? "none"} {...args} />,
} satisfies Meta<typeof DragAndDrop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: { source: { type: "code", language: "tsx", code: usageSnippet } },
	},
	play: async ({ canvas }) => {
		const input = await canvas.findByLabelText(
			"Drag an image here or click to upload",
		);
		await expect(input).toHaveAttribute("type", "file");
		await expect(input).toHaveAttribute("accept", "image/*");
		await expect(input).toHaveAttribute("aria-invalid", "false");
	},
};

export const Localized: Story = {
	args: {
		label: "Húzd ide a képet vagy kattints ide a feltöltéshez",
		previewAlt: "A feltöltött kép előnézete",
		replaceLabel: "Kattints vagy húzz ide egy képet a cseréhez",
	},
};

export const WithPreview: Story = {
	args: { previewUrl: sampleImage },
};

export const WithError: Story = {
	args: { error: "Please choose an image" },
	play: async ({ canvas, canvasElement }) => {
		const message = await canvas.findByText("Please choose an image");
		const input = fileInput(canvasElement);
		await expect(input).toHaveAttribute("aria-invalid", "true");
		await expect(input).toHaveAttribute("aria-describedby", message.id);
	},
};

export const Disabled: Story = {
	args: { disabled: true },
	play: async ({ canvasElement }) => {
		await expect(fileInput(canvasElement)).toBeDisabled();
	},
};

export const PdfOnly: Story = {
	args: {
		accept: ".pdf,application/pdf",
		label: "Drag a PDF here or click to upload",
	},
};

export const PicksFileInDialog: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvasElement, userEvent, args }) => {
		const file = imageFile();
		// clicking the label opens the file dialog, like a real click
		await userEvent.upload(zone(canvasElement), file);
		await expect(args.onFileSelect).toHaveBeenCalledOnce();
		await expect(args.onFileSelect).toHaveBeenLastCalledWith(file);

		// the same file can be chosen again
		await userEvent.upload(zone(canvasElement), file);
		await expect(args.onFileSelect).toHaveBeenCalledTimes(2);
	},
};

export const CancelledDialogDoesNothing: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvasElement, args }) => {
		// closing the dialog without a choice fires a change event with no file
		fileInput(canvasElement).dispatchEvent(new Event("change", { bubbles: true }));
		await expect(args.onFileSelect).not.toHaveBeenCalled();
	},
};

export const DropSelectsFirstFile: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvasElement, args }) => {
		const first = imageFile("first.png");
		drag(zone(canvasElement), "drop", [first, imageFile("second.png")]);
		await expect(args.onFileSelect).toHaveBeenCalledOnce();
		await expect(args.onFileSelect).toHaveBeenLastCalledWith(first);
	},
};

export const DropWithoutFilesDoesNothing: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvasElement, args }) => {
		const { event } = drag(zone(canvasElement), "drop");
		await expect(event.defaultPrevented).toBe(true);
		await expect(args.onFileSelect).not.toHaveBeenCalled();
	},
};

export const RejectsWrongTypeWithHandler: Story = {
	tags: ["!dev", "!autodocs"],
	args: { onReject: fn() },
	play: async ({ canvasElement, args }) => {
		const wrong = textFile();
		drag(zone(canvasElement), "drop", [wrong]);
		await expect(args.onReject).toHaveBeenCalledOnce();
		await expect(args.onReject).toHaveBeenLastCalledWith(wrong);
		await expect(args.onFileSelect).not.toHaveBeenCalled();
	},
};

export const RejectsWrongTypeWithoutHandler: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvasElement, args }) => {
		// no onReject: the file is ignored and nothing breaks
		drag(zone(canvasElement), "drop", [textFile()]);
		await expect(args.onFileSelect).not.toHaveBeenCalled();
	},
};

export const AcceptRules: Story = {
	tags: ["!dev", "!autodocs"],
	args: { accept: ".PNG, image/webp, audio/*", onReject: fn() },
	play: async ({ canvasElement, args }) => {
		const target = zone(canvasElement);
		const drop = (name: string, type: string) =>
			drag(target, "drop", [new File(["x"], name, { type })]);

		drop("logo.PNG", ""); // by extension, in any letter case
		drop("photo.webp", "image/webp"); // by exact type
		drop("song.mp3", "audio/mpeg"); // by group
		await expect(args.onFileSelect).toHaveBeenCalledTimes(3);

		drop("notes.txt", "text/plain");
		drop("clip.mp4", "video/mp4");
		await expect(args.onFileSelect).toHaveBeenCalledTimes(3);
		await expect(args.onReject).toHaveBeenCalledTimes(2);
	},
};

export const EmptyAcceptTakesAnyFile: Story = {
	tags: ["!dev", "!autodocs"],
	args: { accept: "" },
	play: async ({ canvasElement, args }) => {
		drag(zone(canvasElement), "drop", [textFile()]);
		await expect(args.onFileSelect).toHaveBeenCalledOnce();
	},
};

export const ShowsDragState: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvasElement }) => {
		const target = zone(canvasElement);
		await expect(target).not.toHaveAttribute("data-dragging");

		drag(target, "dragenter", [imageFile()]);
		await waitFor(() => expect(target).toHaveAttribute("data-dragging"));

        // dragover must be cancelled, otherwise the browser does not allow the drop
        const over = dragOver(target);
        await expect(over.event.defaultPrevented).toBe(true);
        await expect(over.dataTransfer.dropEffect).toBe("copy");

		drag(target, "dragleave");
		await waitFor(() => expect(target).not.toHaveAttribute("data-dragging"));

		drag(target, "dragenter", [imageFile()]);
		await waitFor(() => expect(target).toHaveAttribute("data-dragging"));
		drag(target, "drop", [imageFile()]);
		await waitFor(() => expect(target).not.toHaveAttribute("data-dragging"));
	},
};

export const DisabledIgnoresDrops: Story = {
	tags: ["!dev", "!autodocs"],
	args: { disabled: true },
	play: async ({ canvasElement, args }) => {
		const target = zone(canvasElement);

		drag(target, "dragenter", [imageFile()]);
		await expect(target).not.toHaveAttribute("data-dragging");

        const over = dragOver(target);
        await expect(over.event.defaultPrevented).toBe(true);
        await expect(over.dataTransfer.dropEffect).toBe("none");

		// the browser must not open the dropped file either
		const drop = drag(target, "drop", [imageFile()]);
		await expect(drop.event.defaultPrevented).toBe(true);
		await expect(args.onFileSelect).not.toHaveBeenCalled();
	},
};

export const PreviewCanBeReplaced: Story = {
	tags: ["!dev", "!autodocs"],
	args: { previewUrl: sampleImage },
	play: async ({ canvas, canvasElement, args }) => {
		await expect(
			await canvas.findByAltText("Preview of the uploaded image"),
		).toBeInTheDocument();
		await expect(
			canvas.getByText("Click or drop an image to replace it"),
		).toBeInTheDocument();

		const replacement = imageFile("new.png");
		drag(zone(canvasElement), "drop", [replacement]);
		await expect(args.onFileSelect).toHaveBeenLastCalledWith(replacement);
		// the demo swaps in the new preview
		await waitFor(() =>
			expect(canvas.getByAltText("Preview of the uploaded image")).not.toHaveAttribute(
				"src",
				sampleImage,
			),
		);
	},
};

export const FitsNarrowColumn: Story = {
	tags: ["!dev", "!autodocs"],
	decorators: [
		(Story) => (
			<div className="w-50">
				<Story />
			</div>
		),
	],
	play: async ({ canvas, canvasElement }) => {
		await canvas.findByText("Drag an image here or click to upload");
		const box = zone(canvasElement).getBoundingClientRect();
		await expect(Math.abs(box.width - 200)).toBeLessThan(2);
		await expect(Math.abs(box.width - box.height)).toBeLessThan(2); // stays square

		// the text stays inside the zone, and the icon shrinks to its smallest size
		const text = canvas
			.getByText("Drag an image here or click to upload")
			.getBoundingClientRect();
		await expect(text.left).toBeGreaterThanOrEqual(box.left);
		await expect(text.right).toBeLessThanOrEqual(box.right);
		await expect(text.bottom).toBeLessThanOrEqual(box.bottom);
		const icon = canvasElement.querySelector("svg")!.getBoundingClientRect();
		await expect(Math.abs(icon.width - 48)).toBeLessThan(1);
	},
};

export const StopsAtMaxWidth: Story = {
	tags: ["!dev", "!autodocs"],
	decorators: [
		(Story) => (
			<div className="w-150">
				<Story />
			</div>
		),
	],
	play: async ({ canvas, canvasElement }) => {
		await canvas.findByText("Drag an image here or click to upload");
		const box = zone(canvasElement).getBoundingClientRect();
		await expect(Math.abs(box.width - 350)).toBeLessThan(2);

		// the icon grows with the zone, up to a limit
		const icon = canvasElement.querySelector("svg")!.getBoundingClientRect();
		await expect(icon.width).toBeGreaterThan(48);
		await expect(icon.width).toBeLessThanOrEqual(80);
	},
};

export const FillsParentWithFullMaxWidth: Story = {
	tags: ["!dev", "!autodocs"],
	args: { maxWidth: "100%" },
	decorators: [
		(Story) => (
			<div className="w-150">
				<Story />
			</div>
		),
	],
	play: async ({ canvas, canvasElement }) => {
		await canvas.findByText("Drag an image here or click to upload");
		const box = zone(canvasElement).getBoundingClientRect();
		await expect(Math.abs(box.width - 600)).toBeLessThan(2);
		await expect(Math.abs(box.width - box.height)).toBeLessThan(2);
	},
};