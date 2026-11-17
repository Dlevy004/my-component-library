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
import { LoginForm, type LoginFormProps } from "./LoginForm";
import componentSource from "./LoginForm.tsx?raw";

const description = [
	"A sign-in form with email and password fields, an optional \"remember me\" box, an error message and a submit button that shows progress. It only collects the credentials and hands them to your code: signing in, redirects and storing a session are up to you.",
	"",
	"**Requirements**",
	"- React 18+, `pnpm add lucide-react`, Tailwind CSS v4 with a class-based dark variant (`@custom-variant dark (&:where(.dark, .dark *));`)",
	"",
	"**Good to know**",
	"- `onSubmit` receives `{ email, password, rememberMe }`. It may be async: while it runs, the button is disabled and shows `submittingLabel`, and a second submit is ignored.",
	"- If `onSubmit` throws, the error's message is shown in the form (`fallbackError` for anything that is not an Error). You can also pass your own `error`, which wins over a caught one.",
	"- Required fields and the email format are checked by the browser before `onSubmit` runs, with the browser's own messages and language.",
	"- **Recommended: add bot protection** such as Cloudflare Turnstile. Render its widget as `children`, keep the token in state, disable the button with `submitDisabled={!token}` and send the token to your server with the credentials. The server must verify it, because a check in the browser alone protects nothing. See the `WithBotProtection` example.",
	"- Slots: `logo` and `description` above the form, `children` above the submit button, `footer` below it.",
	"- It fills the width of its parent up to 28rem. Use `className` to change that. It has no page layout: place it in a column next to an illustration with a grid, as in the `SplitLayout` example.",
	"- The remember box is left out with `showRememberMe={false}`, `rememberMe` is then always false.",
	"- `headingLevel` sets the heading: 1 for a login page, 2 when the form sits in a dialog.",
	"- There is no show/hide password button, and the fields are built in (it does not use `InputField`), so the file works on its own.",
	"- A page title or `noindex` is not part of it. Use `Seo` for that.",
].join("\n");

const usageImport = `import { LoginForm } from "./components/LoginForm/LoginForm";`;

const usageSnippet = `import { useNavigate } from "react-router-dom";
import { LoginForm } from "./components/LoginForm/LoginForm";

export function LoginPage() {
	const navigate = useNavigate();

	return (
		<LoginForm
			title="Sign in"
			description="Sign in to reach the admin area."
			onSubmit={async ({ email, password, rememberMe }) => {
				await login({ email, password, rememberMe }); // throw an Error to show a message
				navigate("/admin", { replace: true });
			}}
		/>
	);
}`;

const botProtectionSnippet = `import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { LoginForm } from "./components/LoginForm/LoginForm";

export function LoginPage() {
	const [token, setToken] = useState("");

	return (
		<LoginForm
			submitDisabled={!token}
			onSubmit={(values) => login({ ...values, turnstileToken: token })}
		>
			<Turnstile
				siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
				onSuccess={setToken}
			/>
		</LoginForm>
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

// Stand-in for a bot protection widget such as Cloudflare Turnstile
function BotProtectionDemo(args: LoginFormProps) {
	const [verified, setVerified] = useState(false);

	return (
		<LoginForm {...args} submitDisabled={!verified}>
			<label className="flex items-center gap-2 rounded-lg border border-neutral-400 p-3 dark:border-neutral-600">
				<input
					type="checkbox"
					checked={verified}
					onChange={(event) => setVerified(event.target.checked)}
				/>
				I am not a robot (demo)
			</label>
		</LoginForm>
	);
}

// Lets a test finish a pending sign-in whenever it wants
let release: () => void = () => {};

const fillCredentials = async (
	canvas: { getByLabelText: (text: string) => HTMLElement },
	userEvent: { type: (element: Element, text: string) => Promise<void> },
) => {
	await userEvent.type(canvas.getByLabelText("Email"), "jane@example.com");
	await userEvent.type(canvas.getByLabelText("Password"), "secret123");
};

const meta = {
	title: "Components/Forms/LoginForm",
	component: LoginForm,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			page: DocsPage,
			description: { component: description },
			source: {
				transform: (code: string) =>
					code.trimStart().startsWith("<")
						? `${usageImport}\n\n${code.replace(
								"onSubmit={() => {}}",
								"onSubmit={handleSubmit}",
							)}`
						: code,
			},
		},
	},
	decorators: [
		(Story, { parameters }) =>
			parameters.layout === "fullscreen" ? (
				<Story />
			) : (
				<div className="w-[min(90vw,28rem)]">
					<Story />
				</div>
			),
	],
	args: {
		onSubmit: fn(),
		emailPlaceholder: "name@example.com",
		passwordPlaceholder: "••••••••",
	},
	argTypes: {
		onSubmit: { control: false },
		children: { control: false },
		logo: { control: false },
		footer: { control: false },
		headingLevel: { control: "inline-radio", options: [1, 2, 3, 4] },
		accentColor: { control: "color" },
		accentColorDark: { control: "color" },
	},
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: { source: { type: "code", language: "tsx", code: usageSnippet } },
	},
	play: async ({ canvas }) => {
		const email = await canvas.findByLabelText("Email");
		await expect(email).toHaveAttribute("type", "email");
		await expect(email).toHaveAttribute("autocomplete", "email");
		await expect(canvas.getByLabelText("Password")).toHaveAttribute(
			"type",
			"password",
		);
		await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
		await expect(canvas.getByRole("button", { name: "Sign in" })).toBeEnabled();
	},
};

export const Localized: Story = {
	args: {
		title: "Bejelentkezés",
		description: "Admin felület eléréséhez jelentkezz be.",
		emailLabel: "E-mail",
		passwordLabel: "Jelszó",
		emailPlaceholder: "pelda@pelda.hu",
		rememberLabel: "Emlékezz rám",
		rememberHint: "Mentsd el a bejelentkezési adataimat legközelebbre.",
		submitLabel: "Bejelentkezés",
		submittingLabel: "Bejelentkezés...",
		fallbackError: "Sikertelen bejelentkezés",
		footer: <p>Példa Kft. &copy; 2026 | Minden jog fenntartva!</p>,
	},
	play: async ({ canvas }) => {
		const hint = await canvas.findByText(
			"Mentsd el a bejelentkezési adataimat legközelebbre.",
		);
		const checkbox = canvas.getByLabelText("Emlékezz rám");
		await expect(checkbox).toHaveAttribute("aria-describedby", hint.id);
	},
};

export const WithLogoAndFooter: Story = {
	args: {
		logo: (
			<span className="grid size-11 place-items-center rounded-xl bg-blue-700 text-xl font-bold text-white">
				A
			</span>
		),
		description: "Welcome back! Sign in to continue.",
		rememberHint: "Keep me signed in on this device.",
		footer: (
			<p>
				No account yet? <a href="#register" className="underline">Create one</a>
			</p>
		),
	},
};

export const WithoutRememberMe: Story = {
	args: { showRememberMe: false },
	play: async ({ canvas }) => {
		await canvas.findByLabelText("Email");
		await expect(canvas.queryByRole("checkbox")).not.toBeInTheDocument();
	},
};

export const WithError: Story = {
	args: { error: "Wrong email or password" },
	play: async ({ canvas }) => {
		const alert = await canvas.findByRole("alert");
		await expect(alert).toHaveTextContent("Wrong email or password");
	},
};

export const WithBotProtection: Story = {
	render: (args) => <BotProtectionDemo {...args} />,
	parameters: {
		docs: {
			source: { type: "code", language: "tsx", code: botProtectionSnippet },
		},
	},
	play: async ({ canvas, userEvent }) => {
		const submit = await canvas.findByRole("button", { name: "Sign in" });
		await expect(submit).toBeDisabled();

		await userEvent.click(canvas.getByLabelText("I am not a robot (demo)"));
		await waitFor(() => expect(submit).toBeEnabled());
	},
};

export const SplitLayout: Story = {
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="grid min-h-[480px] lg:grid-cols-2">
				<div className="grid place-items-center p-6">
					<Story />
				</div>
				<div
					aria-hidden="true"
					className="hidden bg-linear-to-br from-sky-400 to-fuchsia-300 lg:block"
				/>
			</div>
		),
	],
};

export const SubmitsValues: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas, userEvent, args }) => {
		await canvas.findByLabelText("Email");
		await fillCredentials(canvas, userEvent);
		await userEvent.click(canvas.getByLabelText("Remember me"));
		await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));

		await waitFor(() => expect(args.onSubmit).toHaveBeenCalledOnce());
		await expect(args.onSubmit).toHaveBeenLastCalledWith({
			email: "jane@example.com",
			password: "secret123",
			rememberMe: true,
		});
	},
};

export const InvalidFieldsBlockSubmit: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas, userEvent, args }) => {
		const email = await canvas.findByLabelText("Email");

		// empty required fields
		await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));
		await expect(email).toBeInvalid();
		await expect(args.onSubmit).not.toHaveBeenCalled();

		// a value that is not an email address
		await userEvent.type(email, "not-an-email");
		await userEvent.type(canvas.getByLabelText("Password"), "secret123");
		await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));
		await expect(email).toBeInvalid();
		await expect(args.onSubmit).not.toHaveBeenCalled();
	},
};

export const ShowsPendingState: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		onSubmit: fn(
			() =>
				new Promise<void>((resolve) => {
					release = resolve;
				}),
		),
	},
	play: async ({ canvas, userEvent }) => {
		await canvas.findByLabelText("Email");
		await fillCredentials(canvas, userEvent);
		await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));

		const pending = await canvas.findByRole("button", { name: "Signing in..." });
		await expect(pending).toBeDisabled();
		await expect(canvas.getByRole("form", { name: "Sign in" })).toHaveAttribute(
			"aria-busy",
			"true",
		);

		release();
		await waitFor(() =>
			expect(canvas.getByRole("button", { name: "Sign in" })).toBeEnabled(),
		);
		await expect(canvas.getByRole("form", { name: "Sign in" })).toHaveAttribute(
			"aria-busy",
			"false",
		);
	},
};

export const IgnoresSecondSubmitWhilePending: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		onSubmit: fn(
			() =>
				new Promise<void>((resolve) => {
					release = resolve;
				}),
		),
	},
	play: async ({ canvas, userEvent, args }) => {
		await canvas.findByLabelText("Email");
		await fillCredentials(canvas, userEvent);

		// two submits in the same moment, before the page has updated
		const form = canvas.getByRole("form", { name: "Sign in" }) as HTMLFormElement;
		form.requestSubmit();
		form.requestSubmit();
		await expect(args.onSubmit).toHaveBeenCalledOnce();

		release();
		await waitFor(() =>
			expect(canvas.getByRole("button", { name: "Sign in" })).toBeEnabled(),
		);
	},
};

export const ShowsThrownError: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		onSubmit: fn(async () => {
			throw new Error("Wrong email or password");
		}),
	},
	play: async ({ canvas, userEvent }) => {
		await canvas.findByLabelText("Email");
		await fillCredentials(canvas, userEvent);
		await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));

		await expect(await canvas.findByRole("alert")).toHaveTextContent(
			"Wrong email or password",
		);
		// the form is usable again and keeps what was typed
		await expect(canvas.getByRole("button", { name: "Sign in" })).toBeEnabled();
		await expect(canvas.getByLabelText("Email")).toHaveValue("jane@example.com");
	},
};

export const UsesFallbackError: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		onSubmit: fn(async () => {
			// something that is not an Error object
			throw "nope";
		}),
	},
	play: async ({ canvas, userEvent }) => {
		await canvas.findByLabelText("Email");
		await fillCredentials(canvas, userEvent);
		await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));

		await expect(await canvas.findByRole("alert")).toHaveTextContent(
			"Sign in failed",
		);
	},
};

let attempts = 0;

export const ClearsErrorOnRetry: Story = {
	tags: ["!dev", "!autodocs"],
	beforeEach: () => {
		attempts = 0;
	},
	args: {
		onSubmit: fn(async () => {
			attempts += 1;
			if (attempts === 1) throw new Error("Wrong email or password");
		}),
	},
	play: async ({ canvas, userEvent, args }) => {
		await canvas.findByLabelText("Email");
		await fillCredentials(canvas, userEvent);
		await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));
		await expect(await canvas.findByRole("alert")).toBeInTheDocument();

		// the second attempt succeeds and the old message disappears
		await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));
		await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(2));
		await waitFor(() =>
			expect(canvas.queryByRole("alert")).not.toBeInTheDocument(),
		);
	},
};

export const ParentErrorWinsOverCaughtOne: Story = {
	tags: ["!dev", "!autodocs"],
	args: {
		error: "Account locked",
		onSubmit: fn(async () => {
			throw new Error("Wrong email or password");
		}),
	},
	play: async ({ canvas, userEvent, args }) => {
		await canvas.findByLabelText("Email");
		await fillCredentials(canvas, userEvent);
		await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));

		await waitFor(() => expect(args.onSubmit).toHaveBeenCalledOnce());
		await expect(canvas.getByRole("alert")).toHaveTextContent("Account locked");
	},
};

export const HeadingLevelTwo: Story = {
	tags: ["!dev", "!autodocs"],
	args: { headingLevel: 2 },
	play: async ({ canvas }) => {
		await expect(
			await canvas.findByRole("heading", { level: 2, name: "Sign in" }),
		).toBeInTheDocument();
	},
};

export const FitsNarrowContainer: Story = {
	tags: ["!dev", "!autodocs"],
	decorators: [
		(Story) => (
			<div className="w-70">
				<Story />
			</div>
		),
	],
	play: async ({ canvas }) => {
		const form = await canvas.findByRole("form", { name: "Sign in" });
		const box = form.getBoundingClientRect();
		await expect(box.width).toBeLessThanOrEqual(280);
		await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
			document.documentElement.clientWidth,
		);

		// the fields fill the form
		const email = canvas.getByLabelText("Email").getBoundingClientRect();
		await expect(Math.abs(email.width - box.width)).toBeLessThan(2);
	},
};

export const StopsAtMaxWidth: Story = {
	tags: ["!dev", "!autodocs"],
	decorators: [
		(Story) => (
			<div className="w-200">
				<Story />
			</div>
		),
	],
	play: async ({ canvas }) => {
		const form = await canvas.findByRole("form", { name: "Sign in" });
		await expect(Math.abs(form.getBoundingClientRect().width - 448)).toBeLessThan(2);
	},
};