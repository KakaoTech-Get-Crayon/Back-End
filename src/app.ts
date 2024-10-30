import API from './api'
import { logger } from './utils/logger'
;(async () => {
    const api = new API()

    api.listen()

    async function shutdown() {
        logger.info('gracefully shutdown')
        await api.close()

        logger.info('shutdown complete')
        process.exit()
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
    process.on('uncaughtException', err => {
        console.log(err)
    })
})()
