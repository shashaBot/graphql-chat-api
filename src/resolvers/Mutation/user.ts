import { getUserId, Context } from '../../utils'

export const user = {
    async editUserDetails(parent, { name, email }, ctx: Context) {
        const id = getUserId(ctx)
        return ctx.prisma.updateUser({
            where: {
                id
            },
            data: {
                email,
                name
            }
        })
    },

    async deleteUser(parent, args, ctx: Context) {
        const id = getUserId(ctx)
        return ctx.prisma.deleteUser({ id })
    }
}
