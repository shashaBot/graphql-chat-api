import { getUserId, Context } from '../utils'

export const Channel = {
    owner: ({ id }, args, ctx: Context) => {
        return ctx.prisma.channel({ id }).owner()
    },

    members: ({ id }, args, ctx: Context) => {
        return ctx.prisma.channel({ id }).members()
    },

    messages: ({ id }, args, ctx: Context) => {
        return ctx.prisma.messages({
            where: {
                receiver: {
                    id,
                },
                deleted: false
            }
        })
    }
}