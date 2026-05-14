import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ImageBlur } from './ImageBlur'

const meta: Meta<typeof ImageBlur> = {
  title: 'UI/ImageBlur',
  component: ImageBlur,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0a0a0a' }] },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ImageBlur>

export const Default: Story = {
  args: {
    src: 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/sample',
    alt: 'Démonstration ImageBlur',
    width: 600,
    height: 400,
    wrapperClassName: 'rounded-xl',
  },
}

export const Square: Story = {
  args: {
    src: 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/cld-sample',
    alt: 'Image carrée',
    width: 300,
    height: 300,
    wrapperClassName: 'rounded-full',
    className: 'rounded-full object-cover',
  },
}

export const FillMode: Story = {
  render: () => (
    <div style={{ position: 'relative', width: 480, height: 320, background: '#1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
      <ImageBlur
        src="https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/sample"
        alt="Mode fill"
        fill
        className="object-cover"
      />
    </div>
  ),
}
