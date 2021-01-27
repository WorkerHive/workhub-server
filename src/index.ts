import Graph, { LoggerConnector } from '@workerhive/graph' 
import { typeDefs } from './types';
import express from 'express';
import bodyParser from 'body-parser'
import cors from 'cors';
import crypto from 'crypto';
import { merge } from 'lodash'
import jwt from 'jsonwebtoken';
import passport from 'passport';
import multer from 'multer';

import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'

import { WorkhubFS } from "@workerhive/ipfs"

import { FlowConnector } from '@workerhive/flow-provider'

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret',
    //issuer: process.env.WORKHUB_DOMAIN ? process.env.WORKHUB_DOMAIN : 'workhub.services',
   // audience: process.env.WORKHUB_DOMAIN ? process.env.WORKHUB_DOMAIN : 'workhub.services'
}

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    let user = await connector.read("TeamMember", {id: jwt_payload.sub})
    if(user){
        done(null, user)
    }else{
        done(null, false)
    }
}))
  
const app = express();

const fsLayer = new WorkhubFS({
    Swarm: [
        `/dns4/${process.env.WORKHUB_DOMAIN ? process.env.WORKHUB_DOMAIN : 'thetechcompany.workhub.services'}/tcp/443/wss/p2p-webrtc-star`
    ]
})

let connector = new FlowConnector({}, {})

let { types, resolvers } = connector.getConfig();

const workhubResolvers = merge({
    Query: {
        swarmKey: (parent) => { 
            return fsLayer.swarmKey
        }
    }
}, resolvers)

let hiveGraph = new Graph(`

    extend type Query {
        swarmKey: String
    }

    extend type Mutation{
        empty: String
    }

    
    type Workflow @crud @configurable{
        id: ID
        name: String @input
        nodes: [JSON] @input
        links: [JSON] @input
    }

    ${types}
    ${typeDefs}
`, workhubResolvers, connector, true)

connector.stores.initializeAppStore({
    url: (process.env.WORKHUB_DOMAIN ? 'mongodb://mongo' : 'mongodb://localhost'),
    dbName: (process.env.WORKHUB_DOMAIN ? 'workhub' : 'workhub')
})

const a = (async () => {
    let stores = await connector.readAll('IntegrationStore')
    console.log("Read stores", stores)
    connector.stores.setupDefaultStores(stores)
})
setTimeout(() => {
    a();
}, 500)

app.use(bodyParser.json())
app.use(cors())

app.post('/login', async (req, res) => {
    let strategy = req.body.strategy;

    let username = req.body.username;
    let password = crypto.createHash('sha256').update(req.body.password).digest('hex');
    let user : any = await connector.read("TeamMember", {username: username, password: password})

    if(user.id){
        res.send({token: jwt.sign({
            sub: user.id,
            name: user.name,
            email: user.email
        }, 'secret')})
    }else{
        res.status(404).send({error: "No user found"})
    }
})

hiveGraph.addTransport((conf:any) => {
    
    app.post('/graphql',/* passport.authenticate('jwt', {session: false}),*/ multer().single('file'), (req : any, res) => {
        let query = req.body.query;
        let variables = req.body.variables || {};
        if(variables && typeof(variables) !== 'object') variables = JSON.parse(variables)
        if(req.file) variables.file = req.file; 
        hiveGraph.executeRequest(
            query,
            variables,
            req.body.operationName,
            {user: req['user'], fs: fsLayer}
        ).then((r) => res.send(r))
    })

    app.get('/graphql', (req, res) => {
        res.sendFile(__dirname + '/index.html')
    })
    
})

app.listen(4002)
