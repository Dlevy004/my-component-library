/// <reference types="vite/client" />


import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
import { MINIMAL_VIEWPORTS } from 'storybook/viewport'

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, { globals, viewMode }) => {
      const dark = globals.theme === 'dark'
      document.documentElement.classList.toggle('dark', dark)
      document.body.style.backgroundColor =
        dark && viewMode === 'story' ? '#171717' : ''

      return viewMode === 'story' ? (
        <div style={{ minHeight: '100vh' }}>
          <Story />
        </div>
      ) : (
        <Story />
      )
    },
  ],
  parameters: {
    options: {
      storySort: { order: ['Introduction', 'Components'] },
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    viewport: { options: MINIMAL_VIEWPORTS },
    docs: {
      canvas: { withToolbar: true },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;