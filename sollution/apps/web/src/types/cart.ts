export type CartLine = {
  id: string
  menuItemId: string
  name: string
  name_arabic: string
  image: string
  unitPrice: number
  quantity: number
  optionsSummary: string
  optionsSummary_arabic: string
  selectedOptionIds: string[]
  specialInstructions?: string
}
