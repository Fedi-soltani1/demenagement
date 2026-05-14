import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Input } from './Input'
import { Textarea } from './Textarea'
import { Select } from './Select'
import { Checkbox } from './Checkbox'

const meta: Meta = {
  title: 'UI/Form Fields',
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0a0a0a' }] },
  },
  tags: ['autodocs'],
}

export default meta

export const TextInput: StoryObj<typeof Input> = {
  render: () => (
    <div style={{ maxWidth: 400, background: '#0a0a0a', padding: 24 }}>
      <Input label="Nom complet" placeholder="Jean Dupont" required />
    </div>
  ),
}

export const InputWithError: StoryObj<typeof Input> = {
  render: () => (
    <div style={{ maxWidth: 400, background: '#0a0a0a', padding: 24 }}>
      <Input
        label="Email"
        type="email"
        placeholder="jean@exemple.com"
        error="Adresse email invalide"
        required
      />
    </div>
  ),
}

export const TextareaField: StoryObj<typeof Textarea> = {
  render: () => (
    <div style={{ maxWidth: 400, background: '#0a0a0a', padding: 24 }}>
      <Textarea
        label="Message"
        placeholder="Décrivez votre déménagement..."
        hint="Minimum 20 caractères"
        required
      />
    </div>
  ),
}

export const SelectField: StoryObj<typeof Select> = {
  render: () => (
    <div style={{ maxWidth: 400, background: '#0a0a0a', padding: 24 }}>
      <Select
        label="Type de déménagement"
        placeholder="Choisissez..."
        options={[
          { value: 'particulier', label: 'Particulier' },
          { value: 'entreprise', label: 'Entreprise' },
          { value: 'international', label: 'International' },
        ]}
        required
      />
    </div>
  ),
}

export const CheckboxField: StoryObj<typeof Checkbox> = {
  render: () => (
    <div style={{ maxWidth: 400, background: '#0a0a0a', padding: 24 }}>
      <Checkbox
        label="J'accepte la politique de confidentialité"
        description="Vos données sont traitées conformément au RGPD."
        required
      />
    </div>
  ),
}
