import * as bcrypt from 'bcryptjs'
import { Context, generateToken } from '../../utils'
import EmailService from '../../services/malingService/EmailService'

const  emailService = new EmailService();

export const auth = {
  async signup(parent, args, ctx: Context) {
    const password = await bcrypt.hash(args.password, 10)
    let token = await generateToken()
    const user = await ctx.prisma.createUser({ 
      ...args, 
      password,
      emailConfirmationToken: token,
      emailConfirmationTokenExpires: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) // 24 hours from now
    })
    ctx.request.session.userId = user.id
    await emailService.sendMail({
      to: args.email,
      from: process.env.FROM_EMAIL,
      subject: 'Verify email',
      html: `Here's your verification token: ${token}`
     })

    return {
      user,
      message: 'A confirmation email has been sent to your email. Please confirm your email using the token sent to you.'
    }
  },

  async login(parent, { email, password }, ctx: Context) {
    const user = await ctx.prisma.user({ email })
    if (!user) {
      throw new Error(`No such user found for email: ${email}`)
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid password')
    }
  
    ctx.request.session.userId = user.id

    return {
      user,
    }
  },

  async forgotPassword(parent, { email }, ctx: Context) {
    const user = await ctx.prisma.user({ email })
    if (!user) {
      throw new Error(`No such user found for email: ${email}`)
    }
    let token
    try {
      token = await generateToken()
      let result = await emailService.sendMail({
        to: email,
        from: process.env.FROM_EMAIL,
        subject: 'Forgot password',
        html: `Here's your password reset token: ${token}`
      })
    }
    catch(e) {
      console.log(e)
      throw new Error(`There was a problem with sending you the email. Please try again later.`)
    }
    await ctx.prisma.updateUser({
      where: {
        email
      },
      data: {
        passwordResetToken: token,
        passwordResetTokenExpires: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) // 24 hours from now
      }
    })
    return {
      success: true,
      message: "Please find the password reset token in your inbox to reset your password."
    }
  },

  async resetPassword(parent, { newPassword, token }, ctx: Context) {
    const validToken = await ctx.prisma.$exists.user({
      passwordResetToken: token,
      passwordResetTokenExpires_gt: new Date()
    })
    if(!validToken) throw new Error('Invalid Token!')

    const password = await bcrypt.hash(newPassword, 10)
    await ctx.prisma.updateUser({
      where: {
        passwordResetToken: token
      },
      data: {
        password,
        passwordResetToken: null,
        passwordResetTokenExpires: null
      }
    })
    return {
      success: true,
      message: 'Password has been reset'
    }
  },

  async verifyEmail(parent, { token }, ctx: Context) {
    const validToken = await ctx.prisma.$exists.user({ 
      emailConfirmationToken: token,
      emailConfirmationTokenExpires_gt: new Date()
    })
    if (!validToken) throw new Error('Invalid token!')
    
    await ctx.prisma.updateUser({
      where: {
        emailConfirmationToken: token
      },
      data: {
        isVerified: true,
        emailConfirmationToken: null,
        emailConfirmationTokenExpires: null
      }
    })

    return {
      success: true,
      message: "Email confirmed!"
    }
  }
  
}
