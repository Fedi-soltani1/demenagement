import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0a0a0a' }] },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Badge>

export const Red: Story = { args: { variant: 'red', children: 'N°1 en Tunisie ★★★★★' } }
export const Gold: Story = { args: { variant: 'gold', children: 'Premium' } }
export const Muted: Story = { args: { variant: 'muted', children: 'Nouveau' } }
export const Outline: Story = { args: { variant: 'outline', children: 'En cours' } }

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3" style={{ background: '#0a0a0a', padding: 24 }}>
      <Badge variant="red">N°1 en Tunisie</Badge>
      <Badge variant="gold">Premium</Badge>
      <Badge variant="muted">Nouveau</Badge>
      <Badge variant="outline">En cours</Badge>
    </div>
  ),
}
