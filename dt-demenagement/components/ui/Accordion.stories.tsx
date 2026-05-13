import type { Meta, StoryObj } from '@storybook/react'
import { Accordion } from './Accordion'

const faqItems = [
  {
    id: '1',
    question: 'Combien coûte un déménagement avec DT Déménagement ?',
    answer:
      'Le coût dépend du volume à déménager, de la distance et des services choisis. Nous vous proposons un devis gratuit et personnalisé. Contactez-nous pour obtenir votre estimation en 24h.',
  },
  {
    id: '2',
    question: 'Intervenez-vous dans toute la Tunisie ?',
    answer:
      'Oui, nous intervenons dans les 24 gouvernorats de Tunisie ainsi que dans 9 pays européens pour les déménagements internationaux.',
  },
  {
    id: '3',
    question: 'Proposez-vous un service de stockage ?',
    answer:
      "Absolument. Nous disposons d'entrepôts sécurisés (gardes meubles) pour stocker vos biens temporairement ou sur longue durée.",
  },
]

const meta: Meta<typeof Accordion> = {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0a0a0a' }] },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Accordion>

export const Default: Story = {
  args: { items: faqItems },
}

export const AllowMultiple: Story = {
  args: { items: faqItems, allowMultiple: true },
}
