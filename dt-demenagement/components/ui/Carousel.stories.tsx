import type { Meta, StoryObj } from '@storybook/react'
import { Carousel } from './Carousel'

const slides = [
  <div key="1" style={{ background: '#1a1a1a', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8f5f0', fontSize: 24, fontWeight: 600 }}>
    Diapositive 1 — Déménagement Résidentiel
  </div>,
  <div key="2" style={{ background: '#2a1010', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8f5f0', fontSize: 24, fontWeight: 600 }}>
    Diapositive 2 — Déménagement d&apos;Entreprise
  </div>,
  <div key="3" style={{ background: '#0a1a0a', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8f5f0', fontSize: 24, fontWeight: 600 }}>
    Diapositive 3 — Déménagement International
  </div>,
]

const meta: Meta<typeof Carousel> = {
  title: 'UI/Carousel',
  component: Carousel,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0a0a0a' }] },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Carousel>

export const Default: Story = {
  args: { items: slides, ariaLabel: 'Carrousel de services' },
}

export const AutoPlay: Story = {
  args: { items: slides, autoPlay: true, autoPlayInterval: 2000, ariaLabel: 'Carrousel automatique' },
}

export const NoArrows: Story = {
  args: { items: slides, showArrows: false, ariaLabel: 'Carrousel sans flèches' },
}

export const NoDots: Story = {
  args: { items: slides, showDots: false, ariaLabel: 'Carrousel sans points' },
}

export const DotsOnly: Story = {
  args: { items: slides, showArrows: false, showDots: true, ariaLabel: 'Carrousel points uniquement' },
}
