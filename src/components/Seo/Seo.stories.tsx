import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { Seo } from "./Seo";
import componentSource from "./Seo.tsx?raw";

const description = [
	"Sets the page `<title>`, meta description, robots rule, canonical URL and Open Graph tags. It renders nothing visible. Use it once per page so search engines and social previews show the right information.",
	"",
	"**Requirements**",
	"- React 18+ with `vite-react-ssg` and React Router 6 (**not** for Next.js)",
    "- `pnpm add vite-react-ssg react-router-dom@6`",
	"- The component must render inside a `vite-react-ssg` app, which provides the head context",
	"",
	"**Good to know**",
	"- `domain` has no trailing slash, `url` starts with `/`. The canonical URL is `domain + url`.",
	"- `image` must be an absolute URL. Without `image` and `defaultImage`, no `og:image` tag is written.",
	"- Use `noindex` for pages that should stay out of search (thank-you pages, admin).",
	"- Twitter card tags are not included.",
	"- It has no visible output, so Storybook only checks the tags in the document head.",
].join("\n");

const meta = {
	title: "Components/Meta/Seo",
	component: Seo,
	tags: ["autodocs"],
    parameters: {
        layout: "centered",
        docs: { description: { component: description } },
    },
	args: {
		title: "Example page",
		description: "A short description for search engines.",
		domain: "https://example.com",
		url: "/about",
	},
	render: (args) => (
		<>
			<Seo {...args} />
			<p>This component renders nothing. It writes meta tags into the document head.</p>
		</>
	),
} satisfies Meta<typeof Seo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async () => {
		await waitFor(() => expect(document.title).toBe("Example page"));
		await expect(
			document.querySelector('link[rel="canonical"]'),
		).toHaveAttribute("href", "https://example.com/about");
		await expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
			"content",
			"index, follow",
		);
        await expect(document.querySelector('meta[property="og:image"]')).toBeNull();
	},
    parameters: {
		docs: {
			source: { code: componentSource, language: "tsx", type: "code" },
		},
	},
};

export const NoIndex: Story = {
	args: { noindex: true },
	play: async () => {
		await waitFor(() =>
			expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
				"content",
				"noindex, nofollow",
			),
		);
	},
};

export const WithImage: Story = {
	args: { image: "https://cdn.example.com/page-cover.jpg" },
	play: async () => {
		await waitFor(() =>
			expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
				"content",
				"https://cdn.example.com/page-cover.jpg",
			),
		);
	},
};

export const WithDefaultImage: Story = {
	args: { defaultImage: "/og-default.jpg" },
	play: async () => {
		await waitFor(() =>
			expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
				"content",
				"https://example.com/og-default.jpg",
			),
		);
	},
};

export const ImageWinsOverDefault: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		image: "https://cdn.example.com/page-cover.jpg",
		defaultImage: "/og-default.jpg",
	},
	play: async () => {
		await waitFor(() =>
			expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
				"content",
				"https://cdn.example.com/page-cover.jpg",
			),
		);
	},
};