"use client";

import {
	useId,
	useRef,
	useState,
	type CSSProperties,
	type FormEvent,
	type ReactNode,
} from "react";
import { KeyRound, Mail } from "lucide-react";

export interface LoginValues {
	/** Value of the email field */
	readonly email: string;
	/** Value of the password field */
	readonly password: string;
	/** Whether the "remember me" box is ticked (always false while the box is hidden) */
	readonly rememberMe: boolean;
}

export interface LoginFormProps {
	/** Called with the entered values when the form is valid and submitted. May be async: the form waits for it and shows the message of an error it throws */
	readonly onSubmit: (values: LoginValues) => void | Promise<void>;
	/** Heading of the form */
	readonly title?: string;
	/** Short text below the heading */
	readonly description?: string;
	/** Level of the heading (1 for a login page, 2 inside a dialog) */
	readonly headingLevel?: 1 | 2 | 3 | 4;
	/** Logo or other content above the heading */
	readonly logo?: ReactNode;
	/** Content below the form, e.g. a copyright line or a link to registration */
	readonly footer?: ReactNode;
	/** Extra content above the submit button, e.g. a bot protection widget */
	readonly children?: ReactNode;
	/** Label of the email field */
	readonly emailLabel?: string;
	/** Label of the password field */
	readonly passwordLabel?: string;
	/** Hint inside the empty email field. It does not replace the label */
	readonly emailPlaceholder?: string;
	/** Hint inside the empty password field */
	readonly passwordPlaceholder?: string;
	/** Show the "remember me" checkbox */
	readonly showRememberMe?: boolean;
	/** Label of the "remember me" checkbox */
	readonly rememberLabel?: string;
	/** Small text under the "remember me" label */
	readonly rememberHint?: string;
	/** Label of the submit button */
	readonly submitLabel?: string;
	/** Label of the submit button while `onSubmit` is running */
	readonly submittingLabel?: string;
	/** Message shown when `onSubmit` throws something that is not an Error */
	readonly fallbackError?: string;
	/** Error message to show, e.g. from your own state. It wins over a message caught from `onSubmit` */
	readonly error?: string;
	/** Disable the submit button, e.g. until a bot check is done */
	readonly submitDisabled?: boolean;
	/** Accent color (submit button, focus outline, checkbox). The button text is white, so pick a color with at least 4.5:1 contrast against white */
	readonly accentColor?: string;
	/** Accent color in dark mode. The button text is dark, so pick a light color */
	readonly accentColorDark?: string;
	/** Extra classes for the whole form block, e.g. to change the width */
	readonly className?: string;
}

const INPUT =
	"w-full rounded-[11px] border-2 border-transparent bg-neutral-200 py-[0.7rem] pr-3 pl-10 text-neutral-900 shadow-[inset_0_0_10px_0_rgba(0,0,0,0.2)] placeholder:text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--login-accent) dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-400 dark:focus-visible:outline-(--login-accent-dark)";
const ICON =
	"pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-neutral-600 dark:text-neutral-400";

export function LoginForm({
	onSubmit,
	title = "Sign in",
	description,
	headingLevel = 1,
	logo,
	footer,
	children,
	emailLabel = "Email",
	passwordLabel = "Password",
	emailPlaceholder,
	passwordPlaceholder,
	showRememberMe = true,
	rememberLabel = "Remember me",
	rememberHint,
	submitLabel = "Sign in",
	submittingLabel = "Signing in...",
	fallbackError = "Sign in failed",
	error,
	submitDisabled,
	accentColor = "#2563eb",
	accentColorDark = "#60a5fa",
	className = "",
}: LoginFormProps) {
	const ids = useId();
	const titleId = `${ids}-title`;
	const emailId = `${ids}-email`;
	const passwordId = `${ids}-password`;
	const rememberId = `${ids}-remember`;
	const hintId = `${ids}-hint`;

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState("");
	// a ref, because state is not updated yet when a second submit arrives right away
	const inFlight = useRef(false);

	const message = error || submitError;
	const Heading = `h${headingLevel}` as const;

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (inFlight.current) return;
		inFlight.current = true;
		setSubmitError("");
		setSubmitting(true);

		try {
			await onSubmit({ email, password, rememberMe });
		} catch (caught) {
			setSubmitError(caught instanceof Error ? caught.message : fallbackError);
		} finally {
			inFlight.current = false;
			setSubmitting(false);
		}
	};

	return (
		<div
			style={
				{
					"--login-accent": accentColor,
					"--login-accent-dark": accentColorDark,
				} as CSSProperties
			}
			className={`flex w-full max-w-md flex-col items-center gap-6 text-neutral-900 dark:text-neutral-100 ${className}`}
		>
			{logo && (
				<div className="flex min-h-11 items-center justify-center">{logo}</div>
			)}

			<div className="flex w-full flex-col gap-1 text-center">
				<Heading id={titleId} className="text-2xl font-bold">
					{title}
				</Heading>
				{description && (
					<p className="text-neutral-600 dark:text-neutral-400">{description}</p>
				)}
			</div>

			<form
				aria-labelledby={titleId}
				aria-busy={submitting}
				onSubmit={handleSubmit}
				className="flex w-full flex-col gap-4"
			>
				<div className="flex flex-col gap-[5px]">
					<label htmlFor={emailId}>{emailLabel}</label>
					<div className="relative">
						<Mail aria-hidden="true" className={ICON} />
						<input
							id={emailId}
							name="email"
							type="email"
							autoComplete="email"
							required
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder={emailPlaceholder}
							className={INPUT}
						/>
					</div>
				</div>

				<div className="flex flex-col gap-[5px]">
					<label htmlFor={passwordId}>{passwordLabel}</label>
					<div className="relative">
						<KeyRound aria-hidden="true" className={ICON} />
						<input
							id={passwordId}
							name="password"
							type="password"
							autoComplete="current-password"
							required
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							placeholder={passwordPlaceholder}
							className={INPUT}
						/>
					</div>
				</div>

				{showRememberMe && (
					<div className="flex items-start gap-2">
						<input
							id={rememberId}
							type="checkbox"
							checked={rememberMe}
							onChange={(event) => setRememberMe(event.target.checked)}
							aria-describedby={rememberHint ? hintId : undefined}
							className="mt-1 size-4 cursor-pointer accent-(--login-accent) dark:accent-(--login-accent-dark)"
						/>
						<div className="flex flex-col">
							<label htmlFor={rememberId} className="cursor-pointer">
								{rememberLabel}
							</label>
							{rememberHint && (
								<small
									id={hintId}
									className="text-neutral-600 dark:text-neutral-400"
								>
									{rememberHint}
								</small>
							)}
						</div>
					</div>
				)}

				{message && (
					<p
						role="alert"
						className="text-sm font-bold text-red-700 dark:text-red-400"
					>
						{message}
					</p>
				)}

				{children}

				<button
					type="submit"
					disabled={submitting || submitDisabled}
					className="w-full cursor-pointer rounded-[11px] border-none bg-(--login-accent) p-3 font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--login-accent) disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none dark:bg-(--login-accent-dark) dark:text-neutral-900 dark:focus-visible:outline-(--login-accent-dark)"
				>
					{submitting ? submittingLabel : submitLabel}
				</button>
			</form>

			{footer && (
				<div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
					{footer}
				</div>
			)}
		</div>
	);
}