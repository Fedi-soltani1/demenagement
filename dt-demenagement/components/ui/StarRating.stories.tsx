import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StarRating } from './StarRating'

const meta: Meta<typeof StarRating> = {
  title: 'UI/StarRating',
  component: StarRating,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0a0a0a' }] },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof StarRating>

export const FiveStars: Story = { args: { rating: 5 } }
export const FourPointFive: Story = { args: { rating: 4.5 } }
export const WithValue: Story = { args: { rating: 4.8, showValue: true } }
export const Large: Story = { args: { rating: 5, size: 'lg', showValue: true } }
export const Small: Story = { args: { rating: 3.5, size: 'sm' } }
