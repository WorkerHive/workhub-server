
export const typeDef = `
extend type Query {
  calendar(startRange: Int, endRange: Int): [CalendarBooking]
}

extend type Mutation {
  addBooking(time: CalendarInput, projectId: ID, booking: BookingInput): CalendarBooking
}

input CalendarInput {
    allDay: Boolean
    startTime: Int
    endTime: Int
    date: Int
}

input BookingInput {
    equipment: [ID]
    team: [ID]
}

type BookingItems {
    equipment: [Equipment]
    team: [TeamMember]
}

type CalendarBooking{
    id: ID
    allDay: Boolean
    startTime: Int
    endTime: Int
    date: Int
    project: Project
    items: BookingItems
}

`

export const resolvers = {
Query: {
  calendar: async (parent, {startRange, endRange}, context) => {
    let q : any = {}
    if(startRange){
        q.startTime = {$gte: startRange}
    }

    if(endRange){
        q.endTime = {$lte: endRange}
    }

    let calendar = await context.connections.flow.request("Calendar", q)
    return calendar
  }
},
Mutation: {
  addBooking: async (parent, {time, projectId, booking}, context) => {
    let _booking = {
        ...time,
        project: projectId,
        items: booking
    }

    return await context.connections.flow.add("Calendar", _booking)
  },
},
CalendarBooking: {
  items: async (parent, args, context) => {
    let team = await context.connections.flow.request("Team Members", {id: {$in: parent.items && parent.items.team || []}})
    let equipment = await context.connections.flow.request("Equipment", {id: {$in: parent.items && parent.items.equipment || []}})
    return {
      team: team,
      equipment: equipment
    }
  },
  project: async (parent, args, context) => {
    let project = await context.connections.flow.request("Projects", {id: parent.project})
    return project.length > 0 && project[0];
  }
}
}
