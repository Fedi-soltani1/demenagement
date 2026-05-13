import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0a0a0a' }] },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Card>

const Content = () => (
  <>
    <h3 style={{ color: '#f8f5f0', marginBottom: 8 }}>Déménagement Tunisie</h3>
    <p style={{ color: '#a0a0a0', fontSize: 14 }}>
      Solutions sur mesure pour particuliers et entreprises à travers toute la Tunisie.
    </p>
  </>
)

export const Default: Story = {
  args: { variant: 'default', children: <Content /> },
}

export const Glass: Story = {
  args: { variant: 'glass', children: <Content /> },
}

export const Bordered: Story = {
  args: { variant: 'bordered', children: <Content /> },
}

export const WithHover: Story = {
  args: { variant: 'glass', hover: true, children: <Content /> },
}
