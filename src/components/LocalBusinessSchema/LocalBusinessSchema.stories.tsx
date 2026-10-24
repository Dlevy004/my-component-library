import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { LocalBusinessSchema } from "./LocalBusinessSchema";
import componentSource from "./LocalBusinessSchema.tsx?raw";

const description = [
	"Adds `LocalBusiness` structured data (JSON-LD) to the page head, so search engines can show your business name, address, phone number and location in rich results. It renders nothing visible. Use it once, usually on the home or contact page.",
	"",
	"**Requirements**",
	"- React 18+ with `vite-react-ssg` (**not** for Next.js, add the JSON-LD script directly in the page there)",
	"- `pnpm add vite-react-ssg react-router-dom`",
	"- The component must render inside a `vite-react-ssg` app, which provides the head context",
	"",
	"**Good to know**",
	"- `type` can be any schema.org business type, e.g. `HVACBusiness`, `Restaurant`, `Dentist`.",
	"- `url` and `image` must be absolute URLs. With a bundled image: `image={`${domain}${logo}`}`.",
	"- Empty fields are left out of the output.",
	"- Check the result with Google's Rich Results Test.",
	"- It has no visible output, so Storybook only checks the JSON in the document head.",
].join("\n");

function readSchema() {
	const el = document.querySelector('script[type="application/ld+json"]');
	return el ? JSON.parse(el.textContent ?? "{}") : null;
}

const meta = {
	title: "Components/Meta/LocalBusinessSchema",
	component: LocalBusinessSchema,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: { description: { component: description } },
	},
	args: {
		type: "HVACBusiness",
		name: "Example Air Conditioning",
		description: "Air conditioner installation and maintenance.",
		url: "https://example.com",
		image: "https://example.com/logo.avif",
		telephone: "+36301234567",
		address: {
			streetAddress: "Main street 1.",
			addressLocality: "Budapest",
			postalCode: "1011",
			addressCountry: "HU",
		},
		geo: { latitude: 47.4979, longitude: 19.0402 },
	},
	render: (args) => (
		<>
			<LocalBusinessSchema {...args} />
			<p>This component renders nothing. It writes JSON-LD into the document.</p>
		</>
	),
} satisfies Meta<typeof LocalBusinessSchema>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: {
			source: { code: componentSource, language: "tsx", type: "code" },
		},
	},
	play: async () => {
		await waitFor(() => expect(readSchema()).not.toBeNull());
		const schema = readSchema();
		await expect(schema["@type"]).toBe("HVACBusiness");
		await expect(schema.address["@type"]).toBe("PostalAddress");
		await expect(schema.address.postalCode).toBe("1011");
		await expect(schema.geo.latitude).toBe(47.4979);
		await expect(schema.telephone).toBe("+36301234567");
	},
};

export const Minimal: Story = {
	args: {
		type: undefined,
		description: undefined,
		image: undefined,
		telephone: undefined,
		address: undefined,
		geo: undefined,
	},
	play: async () => {
		await waitFor(() => expect(readSchema()).not.toBeNull());
		const schema = readSchema();
		await expect(schema["@type"]).toBe("LocalBusiness");
		await expect(schema.name).toBe("Example Air Conditioning");
		await expect(schema).not.toHaveProperty("address");
		await expect(schema).not.toHaveProperty("geo");
		await expect(schema).not.toHaveProperty("image");
	},
};

export const EscapesMarkup: Story = {
	tags: ["!dev", "!autodocs"],
	args: { name: "</script><b>Evil</b>" },
	play: async () => {
		await waitFor(() => expect(readSchema()).not.toBeNull());
		const el = document.querySelector('script[type="application/ld+json"]');
		await expect(el?.textContent).not.toContain("</script>");
		await expect(readSchema().name).toBe("</script><b>Evil</b>");
	},
};