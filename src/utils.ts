import * as jwt from 'jsonwebtoken'
import { Prisma } from './generated/prisma-client'
import * as crypto from 'crypto'

export interface Context {
  prisma: Prisma
  request?: any
  connection?: any
  session: any
}

export function getUserId(ctx: Context) {
  if(ctx.session && ctx.session.userId) {
    return ctx.session.userId
  }
  throw new AuthError()
}

export class AuthError extends Error {
  constructor() {
    super('Not authorized')
  }
}

export async function generateToken() {
  const buffer = await new Promise(
    (resolve: (buffer: Buffer) => void,
    reject: (msg: string) => void) => {
    crypto.randomBytes(256, function(ex, buffer) {
      if (ex) {
        reject("error generating token");
      }
      resolve(buffer);
    });
  });
  const token = crypto
    .createHash("sha1")
    .update(buffer)
    .digest("hex");

  return token;
}
