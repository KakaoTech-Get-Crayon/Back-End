import express from 'express'
import http from 'http'
import { logger, loggerMiddleware } from '@/utils/logger'
import { NODE_ENV, PORT } from '@/config'
import controllers from '@/controllers'
import middlewares from '@/middlewares'
import cors from 'cors'
import compression from 'compression'
import helmet from 'helmet'

export default class API {
    app: express.Application
    server: http.Server

    constructor() {
        this.app = express()
        this.server = http.createServer(this.app)

        this.setPreMiddleware()
        this.setController()
        this.setPostMiddleware()
    }

    setPreMiddleware() {
        this.app.use(helmet())
        this.app.use(cors())
        this.app.use(express.json())
        this.app.use(compression())
        this.app.use(express.urlencoded({ extended: true }))
        this.app.use(loggerMiddleware)
    }

    setController() {
        this.app.use('/test', controllers.test)
    }

    setPostMiddleware() {
        this.app.use(middlewares.error)
    }

    public listen() {
        this.server.listen(PORT, () => {
            logger.info(`🚀 App listening on the port: ${PORT} ENV: ${NODE_ENV}`)
        })
    }

    public async close(): Promise<void> {
        return new Promise(resolve => {
            this.server.close(() => {
                resolve()
            })
        })
    }
}
