import { getUserId, Context } from '../../utils'

async function checkUserPermission(channelId, ctx) {
    const id = getUserId(ctx)
    const isUserOwner = await ctx.prisma.$exists.channel({
        id: channelId,
        owner: {
            id
        }
    })
    return isUserOwner
}

export const channel = {
    async createChannel(parent, { name, is_private, memberIds }, ctx: Context, info) {
        const ownerId = getUserId(ctx)
        let members = [
            {
                id: ownerId
            }
        ]
        for(let id of memberIds) {
            members.push({id})
        }
        return ctx.prisma.createChannel({
            name,
            owner: {
                connect: {
                    id: ownerId
                }
            },
            members: {
                connect: members
            },
            is_private
        })
    },

    async inviteUsers(parent, { userIds, channelId }, ctx: Context, info) {
        const isUserOwner = await checkUserPermission(channelId, ctx)
        if(!isUserOwner) throw new Error('Invalid permissions, user is not the sender of message!')
        
        let newMembers = []
        for(let id of userIds) {
            newMembers.push({id})
        }
        try {
            await ctx.prisma.updateChannel({
                where: {
                    id: channelId
                },
                data: {
                    members: {
                        connect: newMembers
                    }
                }
            })
        }
        catch(e) {
            return {
                success: false,
                errors: {
                    path: "inviteUsers",
                    message: e.message
                }
            }
        }

        return {
            success: true
        }
    },

    async kickUsers(parent, { userIds, channelId }, ctx: Context, info) {
        const isUserOwner = await checkUserPermission(channelId, ctx)
        if(!isUserOwner) throw new Error('Invalid permissions, user is not the sender of message!')
        let kickedUsers = []
        for(let id of userIds) {
            kickedUsers.push({id})
        }
        try {
            if(userIds.indexOf(ctx.session.userId)) {
                throw new Error('Owner can\'t kick themselves out of channel')
            }
            ctx.prisma.updateChannel({
                where: {
                    id: channelId
                },
                data: {
                    members: {
                        disconnect: kickedUsers
                    }
                }
            })
        } catch(e) {
            return {
                success: false,
                error: {
                    path: "kickUsers",
                    message: e.message
                }
            }
        }
        return {
            success: true
        }
    },

    async enterChannel(parent, { channelId }, ctx: Context) {
        const canEnter = await ctx.prisma.$exists.channel({
            id: channelId,
            is_private: false
        })
        if (!canEnter) {
            throw new Error('Can\'t enter private channel without invitation from owner')
        }
        return ctx.prisma.updateChannel({
            where: {
                id: channelId
            },
            data: {
                members: {
                    connect: {
                        id: getUserId(ctx)
                    }
                }
            }
        })
    },

    async exitChannel(parent, { channelId }, ctx: Context) {
        const id = getUserId(ctx)
        const ownerId = await ctx.prisma.channel({ id: channelId }).owner().id
        if (ownerId === id)
            throw new Error('Owner can\'t leave their own channel')
        return ctx.prisma.updateChannel({
            where: {
                id: channelId
            },
            data: {
                members: {
                    disconnect: {
                        id: getUserId(ctx)
                    }
                }
            }
        })
    },

    async deleteChannel(parent, { channelId }, ctx: Context) {
        return ctx.prisma.updateChannel({
            where: {
                id: channelId
            },
            data: {
                deleted: true
            }
        })
    }
}
