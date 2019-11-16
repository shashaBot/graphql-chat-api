import { Query } from './Query'
import { Subscription } from './Subscription'
import { auth } from './Mutation/auth'
import { channel } from './Mutation/channel'
import { user } from './Mutation/user'
import { message } from './Mutation/message'

import { Channel } from './Channel'
import { Message } from './Message'

export default {
  Query,
  Mutation: {
    ...auth,
    ...user,
    ...channel,
    ...message,
  },
  Subscription,
  Channel,
  Message
}
