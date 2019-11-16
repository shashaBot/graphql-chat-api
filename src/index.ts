import { GraphQLServer } from 'graphql-yoga'
import * as session from 'express-session'
import * as morgan from 'morgan'
import { upload } from 'graphql-middleware-apollo-upload-server'

import { prisma } from './generated/prisma-client'

import resolvers from './resolvers'
import { uploadToS3 } from './services/uploadService/UploadService'

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: params => {
    let session = null
    if (params.request) {
      session = params.request['session']
    } else if (params['webSocket']) {
      // known issue:
      // can't access webSocket here
    }
    return {
      ...params,
      prisma,
      session: params && params['request'] && params['request']['session'],
    }
  },
  middlewares: [upload({ uploadHandler: uploadToS3 })]
})

const SESSION_SECRET = "blahblah"
const sessionParser = session({
  name: "auth",
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
})

morgan.token('graphql-query', (req) => {
  const {query, variables, operationName} = req.body;
  if (operationName !== 'IntrospectionQuery')
    return `GRAPHQL: \nOperation Name: ${operationName} \nQuery: ${query} \nVariables: ${JSON.stringify(variables)}`;
  return
})

server.express.use(sessionParser)
server.express.use(morgan(':graphql-query'))

const cors = {
  credentials: true,
  origin: "http://localhost:4000"
}

server.start({
  cors,
  subscriptions: {
    onConnect: async (connectionParams, webSocket) => {
      const request = webSocket.upgradeReq
      sessionParser(request, {}, () => {
        // should be added to context
        return {
          session: request.session
        }
      })
    },
  },
}, () => console.log(`Server is running on http://localhost:4000`))
