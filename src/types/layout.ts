
import {v4 as uuidv4} from 'uuid';

export const typeDef = `

type PageLayout @crud {
    id: ID
    items: [LayoutItem] @input
    data: [LayoutData] @input
}

type LayoutItem @crud {
    i: String @input
    x: Int @input
    y: Int @input
    w: Int @input
    h: Int @input
    maxW: Int @input
    maxH: Int @input
    component: String @input
    moved: Boolean @input
    static: Boolean @input
}

type LayoutData @crud {
    type: String @input
    methods: JSON @input
}

`
