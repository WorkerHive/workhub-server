
export const typeDef = `

  type Equipment @crud @configurable {
    "A piece of equipment"
    id: ID
    name: String @input
    type: String @input
    description: String @input
  }
`

