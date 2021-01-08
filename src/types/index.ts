import lodash from 'lodash';

import { 
  typeDef as Project,
  resolvers as projectResolvers
} from './project';

import {
  typeDef as Team,
} from './team';

import {
  typeDef as Equipment,
} from './equipment'

import {
  typeDef as Calendar,
  resolvers as calendarResolvers
} from './calendar';

import {
  typeDef as File,
  resolvers as fileResolvers
} from './file'

import {
  typeDef as User,
  resolvers as userResolvers
} from './user';

import {
  typeDef as Knowledge
} from './knowledge'

import {
  typeDef as Integrations,
  resolvers as integrationResolvers
} from './integrations';

import {
  typeDef as Contacts
} from './contact'

const { merge } = lodash;


export const resolvers = merge(projectResolvers, fileResolvers, userResolvers, integrationResolvers, calendarResolvers)
export const typeDefs = [Contacts, Knowledge, Project, Team, Equipment, File, User, Integrations, Calendar].join('\n')
