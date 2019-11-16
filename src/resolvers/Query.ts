import { getUserId, Context, AuthError } from '../utils'

export const Query = {
  channels: (parent, args, ctx: Context) => {
    console.log(ctx)
    let id, where
    try {
      id = getUserId(ctx)
      where = {
        AND: [{
          OR: [
            {
            is_private: false
            },
            {
            members_some: {
              id
            }
          }],
          deleted: false
        }]
      }
    }
    catch(e) {
      where = {
        is_private: false
      }
    }

    return ctx.prisma.channels({ where })
  },

  me: (parent, args, ctx: Context) => {
    const id = getUserId(ctx)
    return ctx.prisma.user({ id })
  },

  users: (parent, args, ctx: Context) => {
    return ctx.prisma.users()
  },

  advancedSearch: (parent, { searchParams }, ctx: Context) => {
    const id = getUserId(ctx)
    const { senderId, text_contains, channelId } = searchParams
    let where = {
      receiver: {
        members_some: {
          id
        }
      }
    }
    if (senderId) {
      where['sender'] = {
        id: senderId
      }
    }
    if (text_contains) {
      where['text_contains'] = text_contains
    }
    if (channelId) {
      where['receiver'] = {
        // @ts-ignore
        id: channelId,
        members_some: {
          id
        }
      }
    }
    return ctx.prisma.messages({ where })
  }

}
