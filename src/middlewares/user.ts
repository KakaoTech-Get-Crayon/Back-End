import { Request, Response, NextFunction } from 'express'
import { prisma } from '@/prisma'
import { verify } from 'jsonwebtoken'
import { jwtPayload } from '@/types/user'

export async function verifyUser(req: Request, res: Response, next: NextFunction) {
    const token = req.header('Authorization')
    if (!token) {
        throw new Error('No token provided')
    }
    if (!token.startsWith('Bearer ')) {
        throw new Error('not bearer token')
    }

    try {
        const jwt = token.split(' ')[1]
        const payload = verify(jwt, 'secret') as jwtPayload
        const user = await prisma.user.findUnique({
            where: { phoneNumber: payload.phoneNumber },
        })
        req.user = user

        next()
    } catch (error) {
        throw new Error(error.message)
    }
}
