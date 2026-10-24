import { Head } from "vite-react-ssg";

export interface SeoProps {
	/** Page title */
	readonly title: string;
	/** Meta description */
	readonly description: string;
	/** Site origin without trailing slash, e.g. https://example.com */
	readonly domain: string;
	/** Path of the current page, e.g. /about */
	readonly url?: string;
	/** Absolute URL of the Open Graph image for this page */
	readonly image?: string;
	/** Path of the fallback image on your domain, e.g. /og-default.jpg */
	readonly defaultImage?: string;
	/** Ask search engines not to index this page */
	readonly noindex?: boolean;
}

export function Seo({
	title,
	description,
	domain,
	url = "",
	image,
	defaultImage,
	noindex = false,
}: SeoProps) {
	const currentUrl = `${domain}${url}`;
	const ogImage = image ?? (defaultImage ? `${domain}${defaultImage}` : undefined);

	return (
		<Head>
			<title>{title}</title>
			<meta name="description" content={description} />
			<meta
				name="robots"
				content={noindex ? "noindex, nofollow" : "index, follow"}
			/>
			<link rel="canonical" href={currentUrl} />

			<meta property="og:type" content="website" />
			<meta property="og:url" content={currentUrl} />
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			{ogImage && <meta property="og:image" content={ogImage} />}
		</Head>
	);
}