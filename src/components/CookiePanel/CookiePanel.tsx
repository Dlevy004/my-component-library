import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
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
  /** Lifetime of the "rejected" decision in days (shorter, so the visitor is asked again sooner) */
  readonly rejectMaxAgeDays?: number
  /** Accent color (icon, link, buttons) */
  readonly accentColor?: string
  /** Accent color used in dark mode. Pick a color with at least 4.5:1 contrast on the panel background */
  readonly accentColorDark?: string
  /** Called when the user accepts, and on return visits when a stored acceptance is found */
  readonly onAccept?: () => void
  /** Called when the user rejects */
  readonly onReject?: () => void
}

type Consent = 'accepted' | 'rejected' | null

const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

function notify() {
  listeners.forEach((l) => l())
}

function readConsent(cookieName: string): Consent {
  const prefix = `${cookieName}=`
  const entry = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(prefix))
  const value = entry?.slice(prefix.length)
  return value === 'accepted' || value === 'rejected' ? value : null
}

function writeConsent(cookieName: string, value: Exclude<Consent, null>, days: number) {
  document.cookie = `${cookieName}=${value}; max-age=${60 * 60 * 24 * days}; path=/; SameSite=Lax`
  notify()
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
  rejectMaxAgeDays = 7,
  accentColor = '#2563eb',
  accentColorDark = '#60a5fa',
  onAccept,
  onReject,
}: CookiePanelProps) {
  const consent = useSyncExternalStore(
    subscribe,
    () => readConsent(cookieName),
    () => 'rejected' as Consent, // server snapshot: keep the panel hidden during SSR
  )

  // The slide-up animation needs one frame with the panel hidden before showing it
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const isVisible = mounted && consent === null

  // Return visit with a stored acceptance: let the host know (e.g. to load analytics)
  const onAcceptRef = useRef(onAccept)
  useEffect(() => {
    onAcceptRef.current = onAccept
  })
  useEffect(() => {
    if (consent === 'accepted') onAcceptRef.current?.()
  }, [consent])

  const handleAccept = () => writeConsent(cookieName, 'accepted', maxAgeDays)

  const handleReject = () => {
    writeConsent(cookieName, 'rejected', rejectMaxAgeDays)
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