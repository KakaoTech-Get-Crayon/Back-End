import express, { Router, Request, Response } from 'express'
import { verifyUser } from '@/middlewares/user'
import { prisma } from '@/prisma'
import {User} from "@prisma/client";

const router: Router = express.Router()

router.get('/', verifyUser, async (req: Request, res: Response) => {
    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 6)
    let user: User
    if(req.user.isFamily===true){
        user = await prisma.user.findUnique({
            where: {
                userId: req.user.familyId
            }
        })
    } else {
        user = req.user
    }
    const [books, totalBooks] = await Promise.all([
        prisma.book.findMany({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                userId: user.userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        }),
        prisma.book.count({
            where: {
                userId: user.userId,
            },
        }),
    ])
    const totalPages = Math.ceil(totalBooks / limit)
    res.status(200).json({
        books: books,
        page: {
            totalBooks: totalBooks,
            totalPages: totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            page: page,
            limit: limit,
        },
    })
})

export default router