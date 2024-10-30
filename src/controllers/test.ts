import express, { Router, Request, Response } from 'express'

const router: Router = express.Router()

router.get('/', async (req:Request, res:Response):Promise<void> => {
    res.status(200).send('Ok')
})
export default router