import { useEffect, useState, type CSSProperties } from 'react'
import { Cookie } from 'lucide-react'

export interface CookiePanelProps {
  /** Panel heading */
  readonly title?: string
  /** Informational text shown above the buttons */
  readonly description?: string
  /** Text of the link to the privacy policy */
  readonly privacyLabel?: string
  /** URL of the privacy policy */
  readonly privacyHref?: string
  /** Accept button label */
  readonly acceptLabel?: string
  /** Reject button label */
  readonly rejectLabel?: string
  /** Name of the cookie that stores the decision */
  readonly cookieName?: string
  /** Lifetime of the "accepted" decision in days */
  readonly maxAgeDays?: number
  /** Accent color (icon, link, buttons) */
  readonly accentColor?: string
  /** Accent color used in dark mode. Pick a color with at least 4.5:1 contrast on the panel background */
  readonly accentColorDark?: string
  /** Called when the user accepts, and on return visits when a stored acceptance is found */
  readonly onAccept?: () => void
  /** Called when the user rejects */
  readonly onReject?: () => void
}

export function CookiePanel({
  title = 'Cookie Consent',
  description = 'This site uses cookies to improve your experience. Learn more:',
  privacyLabel = 'Privacy policy',
  privacyHref = '/privacy-policy',
  acceptLabel = 'Accept',
  rejectLabel = 'Reject',
  cookieName = 'cookie_consent',
  maxAgeDays = 30,
  accentColor = '#2563eb',
  accentColorDark = '#60a5fa',
  onAccept,
  onReject,
}: CookiePanelProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasConsent = document.cookie
      .split(';')
      .some((c) => c.trim().startsWith(cookieName))
    if (!hasConsent) setIsVisible(true)
  }, [cookieName])

  const handleAccept = () => {
    document.cookie = `${cookieName}=accepted; max-age=${60 * 60 * 24 * maxAgeDays}; path=/`
    setIsVisible(false)
    onAccept?.()
  }

  const handleReject = () => {
    setIsVisible(false)
    onReject?.()
  }

  return (
    <dialog
      open
      inert={!isVisible}
      aria-hidden={!isVisible}
      aria-labelledby="cookie-title"
      style={
        {
          '--cookie-accent': accentColor,
          '--cookie-accent-dark': accentColorDark,
        } as CSSProperties
      }
      className={`fixed bottom-5 left-1/2 z-100 m-0 flex w-[min(90%,600px)] -translate-x-1/2 flex-col items-center gap-4 rounded-2xl border-none bg-neutral-100 px-4 py-4 font-medium text-black shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-[translate,visibility] duration-400 ease-in-out motion-reduce:transition-none sm:px-6 dark:bg-neutral-800 dark:text-neutral-100 ${
        isVisible ? 'visible translate-y-0' : 'invisible translate-y-[150%]'
      }`}
    >
      <header className="flex w-full items-center justify-center gap-2 whitespace-nowrap text-(--cookie-accent) dark:text-(--cookie-accent-dark)">
        <Cookie className="h-auto w-10 sm:w-12" aria-hidden="true" />
        <h2 id="cookie-title" className="text-2xl font-bold">
          {title}
        </h2>
      </header>

      <p className="w-full text-left leading-tight">
        {description}&nbsp;
        <a href={privacyHref} className="text-(--cookie-accent) hover:underline dark:text-(--cookie-accent-dark)">
          {privacyLabel}
        </a>
      </p>

      <div className="flex w-full gap-3 sm:gap-6">
        <button
          type="button"
          onClick={handleAccept}
          className="flex-1 cursor-pointer rounded-[10px] border-[3px] border-transparent bg-(--cookie-accent) p-2 font-bold text-neutral-100 transition hover:scale-105 sm:p-3"
        >
          {acceptLabel}
        </button>
        <button
          type="button"
          onClick={handleReject}
          className="flex-1 cursor-pointer rounded-[10px] border-[3px] border-(--cookie-accent) bg-transparent p-2 font-bold text-(--cookie-accent) transition hover:scale-105 sm:p-3 dark:border-(--cookie-accent-dark) dark:text-(--cookie-accent-dark)"
        >
          {rejectLabel}
        </button>
      </div>
    </dialog>
  )
}