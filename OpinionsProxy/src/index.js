require('dotenv').config();
const pino = require('pino');
const logger = pino();
const app = require('./app');

const PORT = process.env.PORT || 4110;
const OPINIONS_SERVICE_URL = process.env.OPINIONS_SERVICE_URL || 'http://opiniones:4100';

const server = app.listen(PORT, () => {
    logger.info(`OpinionsProxy listening on ${PORT}, forwarding to ${OPINIONS_SERVICE_URL}`);
});

const graceful = async () => {
    logger.info('Shutting down opinions-proxy...');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
};

process.on('SIGINT', graceful);
process.on('SIGTERM', graceful);
