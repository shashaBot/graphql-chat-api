import { getUserId, Context, AuthError } from '../../utils'
import * as urlMetaData from 'url-metadata'

async function checkUserPermission(messageId, ctx: Context) {
    const id = getUserId(ctx)
    const userIsSender = await ctx.prisma.$exists.message({
        id: messageId,
        sender: {
            id
        }
    })
    return userIsSender
}

export const message = {
    async sendMessage(parent, { text, channelId }, ctx: Context, info) {
        const senderId = getUserId(ctx)
        const isUserMember = await ctx.prisma.$exists.channel({
            id: channelId,
            members_some: {
                id: senderId
            }
        })
        if(!isUserMember) throw new Error('Invalid permissions, user is not member of the channel!')
        const urls = text.match(/\bhttps?:\/\/\S+/gi)
        const { title, image, author, description } = await urlMetaData(urls[0])
        return ctx.prisma.createMessage({
            sender: {
                connect: {
                    id: senderId
                }
            },
            receiver: {
                connect: {
                    id: channelId
                }
            },
            text,
            metaData: {
                create: {
                    title, image, author, description
                }
            }
        })
    },

    async editMessage(parent, { id, editedText }, ctx: Context) {
        const userIsSender = await checkUserPermission(id, ctx)
        if(!userIsSender) throw new Error('Invalid permissions, user is not the sender of message!')

        return await ctx.prisma.updateMessage({
            where: {
                id,
            },
            data: {
                text: editedText,
                edited: true,
            }
        })        
    },

    async deleteMessage(parent, { id }, ctx: Context) {
        const userIsSender = await checkUserPermission(id, ctx)
        if(!userIsSender) throw new Error('Invalid permissions, user is not the sender of message!')
        return ctx.prisma.updateMessage({
            where: {
                id,
            },
            data: {
                deleted: true
            }
        })
    }
}
