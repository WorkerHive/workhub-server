export const typeDef = `

    type Contact @crud @configurable{
        id: ID
        name: String @input
        phoneNumber: String @input
        email: String @input
        history: [ContactOrganisation] @input
    }

    type ContactOrganisation @crud @configurable{
        id: ID
        name: String @input
        location: String @input
        contacts: [Contact] @input
    }

`