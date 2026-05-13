import type { Meta, StoryObj } from '@storybook/react'
import { PhoneLink } from './PhoneLink'

const meta: Meta<typeof PhoneLink> = {
  title: 'UI/PhoneLink',
  component: PhoneLink,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0a0a0a' }] },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PhoneLink>

export const Default: Story = {
  args: { numero: '+21652880311', source: 'storybook' },
}

export const WithCustomDisplay: Story = {
  args: { numero: '+21652880311', display: '+216 52 880 311', source: 'storybook' },
}

export const WithoutIcon: Story = {
  args: { numero: '+21652880311', showIcon: false, source: 'storybook' },
}

export const BothNumbers: Story = {
  render: () => (
    <div className="flex gap-6" style={{ background: '#0a0a0a', padding: 24 }}>
      <PhoneLink numero="+21652880311" source="storybook" />
      <PhoneLink numero="+21652880112" source="storybook" />
    </div>
  ),
}
