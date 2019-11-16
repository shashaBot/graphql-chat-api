import { getUserId, Context } from '../utils'

export const Message = {
    sender: ({ id }, args, ctx: Context) => {
        return ctx.prisma.message({ id }).sender()
    },

    receiver: ({ id }, args, ctx: Context) => {
        return ctx.prisma.message({ id }).receiver()
    },

    metaData: ({ id }, args, ctx: Context) => {
        return ctx.prisma.message({ id }).metaData()
    }
}
