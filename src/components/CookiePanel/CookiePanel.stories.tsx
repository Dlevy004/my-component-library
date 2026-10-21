import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, waitFor } from 'storybook/test'
import { CookiePanel } from './CookiePanel'
import componentSource from './CookiePanel.tsx?raw'

const meta = {
  title: 'Components/Feedback/CookiePanel',
  component: CookiePanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "A cookie consent dialog. It stores the visitor's choice in a cookie and calls `onAccept` / `onReject` so the host app decides what to load. <br> Requires `lucide-react` and `Tailwind CSS v4`.",
      },
    },
  },
  decorators: [
    // In Docs, a transformed wrapper keeps the fixed panel inside the story box
    (Story, { viewMode }) =>
      viewMode === 'docs' ? (
        <div style={{ transform: 'translateZ(0)', height: 320 }}>
          <Story />
        </div>
      ) : (
        <Story />
      ),
  ],
  args: { onAccept: fn(), onReject: fn() },
  argTypes: {
    accentColor: { control: 'color' },
    accentColorDark: { control: 'color' },
  },
  beforeEach: () => {
    document.cookie = 'cookie_consent=; max-age=0; path=/'
  },
} satisfies Meta<typeof CookiePanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    docs: {
      source: { code: componentSource, language: 'tsx', type: 'code' },
    },
  },
}

export const Localized: Story = {
  args: {
    title: 'Cookie tájékoztató',
    description:
      'Az oldal a jobb felhasználói élmény érdekében sütiket használ. További tudnivalók:',
    privacyLabel: 'Adatkezelési tájékoztató',
    privacyHref: '/privacypolicy',
    acceptLabel: 'Elfogad',
    rejectLabel: 'Elutasít',
  },
  parameters: {
    docs: {
      source: {
        type: 'code',
        language: 'tsx',
        code: `import { CookiePanel } from './components/CookiePanel'

<CookiePanel
  title="Cookie tájékoztató"
  description="Az oldal a jobb felhasználói élmény érdekében sütiket használ. További tudnivalók:"
  privacyLabel="Adatkezelési tájékoztató"
  privacyHref="/privacypolicy"
  acceptLabel="Elfogad"
  rejectLabel="Elutasít"
  onAccept={() => {
    // e.g. load your analytics script here
  }}
  onReject={() => {
    // optional
  }}
/>`,
      },
    },
  },
}

export const AcceptHidesPanel: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Accept' }))
    await expect(args.onAccept).toHaveBeenCalledOnce()
    await waitFor(() =>
      expect(canvas.queryByRole('dialog')).not.toBeInTheDocument(),
    )
  },
}

export const RejectIsRemembered: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Reject' }))
    await expect(args.onReject).toHaveBeenCalledOnce()
    await expect(document.cookie).toContain('cookie_consent=rejected')
  },
}

export const StoredAcceptanceNotifiesHost: Story = {
  tags: ['!dev', '!autodocs'],
  beforeEach: () => {
    document.cookie = 'cookie_consent=accepted; max-age=3600; path=/'
  },
  play: async ({ args }) => {
    await waitFor(() => expect(args.onAccept).toHaveBeenCalledOnce())
  },
}