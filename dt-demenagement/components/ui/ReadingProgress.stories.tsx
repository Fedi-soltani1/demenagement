import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReadingProgress } from './ReadingProgress'

const meta: Meta<typeof ReadingProgress> = {
  title: 'UI/ReadingProgress',
  component: ReadingProgress,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0a0a0a' }] },
    docs: {
      description: {
        component:
          'Barre de progression fixée en haut de la page. Scroll la page pour voir la barre avancer.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ReadingProgress>

export const Default: Story = {
  render: () => (
    <div style={{ background: '#0a0a0a', color: '#f8f5f0', padding: 32 }}>
      <ReadingProgress />
      {Array.from({ length: 20 }, (_, i) => (
        <p key={i} style={{ marginBottom: 24, lineHeight: 1.8, color: '#a0a0a0' }}>
          Paragraphe {i + 1} — DT Déménagement Tunisie offre des services de déménagement
          professionnels à travers toute la Tunisie et dans 9 pays européens. Notre équipe
          expérimentée prend en charge chaque aspect de votre déménagement avec soin et efficacité.
        </p>
      ))}
    </div>
  ),
}

export const StaticPreview: Story = {
  render: () => (
    <div style={{ background: '#0a0a0a', padding: 32, position: 'relative', height: 120 }}>
      <div
        role="progressbar"
        aria-valuenow={60}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progression de lecture (aperçu statique à 60%)"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: 2,
          width: '60%',
          background: 'var(--color-red, #b52027)',
        }}
      />
      <p style={{ color: '#a0a0a0', marginTop: 24 }}>
        Aperçu statique à 60% — composant réel se met à jour en scrollant la page.
      </p>
    </div>
  ),
}
