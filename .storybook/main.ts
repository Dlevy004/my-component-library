import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from "node:url";

const config: StorybookConfig = {
    "stories": [
        "../src/**/*.mdx",
        "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
    ],
    "addons": [
        "@chromatic-com/storybook",
        "@storybook/addon-vitest",
        "@storybook/addon-a11y",
        "@storybook/addon-docs",
        "@storybook/addon-mcp"
    ],
    "framework": "@storybook/react-vite",

    viteFinal: (viteConfig) => {
		viteConfig.resolve ??= {};
		viteConfig.resolve.alias = {
			...viteConfig.resolve.alias,
			"vite-react-ssg": fileURLToPath(
				new URL("./vite-react-ssg.mock.tsx", import.meta.url),
			),
		};
		return viteConfig;
	},
};
export default config;