import type { Meta, StoryObj } from '@storybook/react'
import { CounterAnimation } from './CounterAnimation'

const meta: Meta<typeof CounterAnimation> = {
  title: 'UI/CounterAnimation',
  component: CounterAnimation,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0a0a0a' }] },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CounterAnimation>

export const Years: Story = {
  args: { target: 15, suffix: '+', className: 'text-5xl text-white' },
}

export const Demenagements: Story = {
  args: { target: 5000, suffix: '+', className: 'text-5xl text-white' },
}

export const Rating: Story = {
  args: { target: 4.9, decimals: 1, className: 'text-5xl text-white' },
}

export const AllStats: Story = {
  render: () => (
    <div className="flex gap-12" style={{ background: '#0a0a0a', padding: 32 }}>
      <div className="text-center">
        <CounterAnimation target={15} suffix="+" className="text-5xl font-bold text-white" />
        <p style={{ color: '#a0a0a0', marginTop: 8 }}>Années d'expérience</p>
      </div>
      <div className="text-center">
        <CounterAnimation target={5000} suffix="+" className="text-5xl font-bold text-white" />
        <p style={{ color: '#a0a0a0', marginTop: 8 }}>Déménagements</p>
      </div>
      <div className="text-center">
        <CounterAnimation target={24} className="text-5xl font-bold text-white" />
        <p style={{ color: '#a0a0a0', marginTop: 8 }}>Villes couvertes</p>
      </div>
    </div>
  ),
}
