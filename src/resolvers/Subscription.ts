import { Context, getUserId } from '../utils'

export const Subscription = {
  messages: {
    subscribe: async (parent, args, ctx: Context) => {
      // context should contain the session object returned from the onConnect function
      // but this doesn't work for some reason :(
      console.log("session: ", ctx.session)
      // const id = getUserId(ctx)
      return ctx.prisma.$subscribe
        .message({
          mutation_in: ['CREATED', 'DELETED', 'UPDATED'],
          // node: {
          //   receiver: {
          //     members_some: {
          //       id
          //     }
          //   }
          // }
        })
        .node()
    }
  }
}
