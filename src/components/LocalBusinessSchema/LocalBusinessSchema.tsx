import { Head } from "vite-react-ssg";

export interface BusinessAddress {
	readonly streetAddress?: string;
	readonly addressLocality?: string;
	readonly postalCode?: string;
	/** Two-letter country code, e.g. HU */
	readonly addressCountry?: string;
}

export interface LocalBusinessSchemaProps {
	/** schema.org type, e.g. "HVACBusiness", "Restaurant", "Dentist" */
	readonly type?: string;
	/** Business name */
	readonly name: string;
	/** Short description of the business */
	readonly description?: string;
	/** Absolute URL of the website */
	readonly url: string;
	/** Absolute URL of the logo or a photo */
	readonly image?: string;
	/** Phone number in international format, e.g. +36301234567 */
	readonly telephone?: string;
	/** Postal address */
	readonly address?: BusinessAddress;
	/** Coordinates of the business */
	readonly geo?: { readonly latitude: number; readonly longitude: number };
}

export function LocalBusinessSchema({
	type = "LocalBusiness",
	name,
	description,
	url,
	image,
	telephone,
	address,
	geo,
}: LocalBusinessSchemaProps) {
	const schema = {
		"@context": "https://schema.org",
		"@type": type,
		name,
		description,
		image,
		url,
		telephone,
		address: address && { "@type": "PostalAddress", ...address },
		geo: geo && { "@type": "GeoCoordinates", ...geo },
	};

	// Escape "<" so data can never close the script element
	const json = JSON.stringify(schema).replaceAll('<', '\\u003c');

	return (
		<Head>
			<script type="application/ld+json">{json}</script>
		</Head>
	);
}