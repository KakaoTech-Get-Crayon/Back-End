import express, { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '@/prisma'
import { v4 as uuid } from 'uuid'

const router:Router = express.Router()

const createSalt = async () => {
    return crypto.randomBytes(32).toString('base64')
}

const createHashPasswd = async (password: string, salt: string) => {
    const hash = crypto.pbkdf2Sync(password, salt, 10169, 32, 'sha512')
    return hash.toString('base64')
}

router.post('/signup', async (req: Request, res: Response) => {
    const findUser = await prisma.user.findUnique({
        where: {
            phoneNumber: req.body.phoneNumber
        }
    })
    if(!findUser){
        const userId = uuid()
        const salt = await createSalt()
        const hash = await createHashPasswd(req.body.password, salt)
        const birthday = new Date(req.body.birth)
        try {
            const user = await prisma.user.create({
                data: {
                    userId: userId,
                    name: req.body.name,
                    phoneNumber: req.body.phoneNumber,
                    password: hash,
                    salt: salt,
                    isFamily: req.body.isFamily,
                    familyId: req.body.familyId || null,
                    birth: birthday,
                }
            })

            if(user.isFamily){
                const familyRelation = await prisma.$transaction([
                    prisma.family.create({
                        data: {
                            userId: userId,
                            familyId: req.body.familyId,
                        }
                    }),
                    prisma.family.create({
                        data: {
                            userId: req.body.familyId,
                            familyId: userId,
                        }
                    }),
                ])
            }

            res.sendStatus(204)
        } catch (error) {
            throw new Error(error)
        }


    }
})

export default router