import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ShareButtons } from './ShareButtons'

const meta: Meta<typeof ShareButtons> = {
  title: 'UI/ShareButtons',
  component: ShareButtons,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0a0a0a' }] },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ShareButtons>

export const Default: Story = {
  args: {
    url: 'https://demenagement.tn/blog/conseils-demenagement',
    title: 'Conseils pour un déménagement réussi — DT Déménagement Tunisie',
  },
}

export const WithoutUrl: Story = {
  args: {
    title: 'DT Déménagement Tunisie — Services professionnels',
  },
}

export const InContext: Story = {
  render: () => (
    <div
      style={{
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: 12,
        padding: 24,
        maxWidth: 480,
      }}
    >
      <p style={{ color: '#a0a0a0', marginBottom: 16, fontSize: 14 }}>Partager cet article :</p>
      <ShareButtons
        url="https://demenagement.tn/blog/conseils-demenagement"
        title="Conseils pour un déménagement réussi"
      />
    </div>
  ),
}
