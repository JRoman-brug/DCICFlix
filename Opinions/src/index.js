require('dotenv').config();
const pino = require('pino');
const logger = pino();
const app = require('./app');
const { connect } = require('./config/mongoose');
const RabbitConsumer = require('./rabbitmq/consumer');
const { onMessage } = require('./controllers/opinionController');

const PORT = process.env.PORT || 4100;
const MONGO_URL = process.env.MONGO_URL;
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const RABBITMQ_EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'ratings';
const QUEUE_NAME = process.env.QUEUE_NAME || 'opinions_queue';

(async () => {
    try {
        await connect(MONGO_URL);
    } catch (err) {
        logger.error('No se pudo conectar a MongoDB. Saliendo.');
        process.exit(1);
    }

    const consumer = new RabbitConsumer(RABBITMQ_URL, RABBITMQ_EXCHANGE, QUEUE_NAME);
    await consumer.init({ onMessage });

    const server = app.listen(PORT, () => {
        logger.info(`Opiniones service escuchando en ${PORT}`);
    });

    const graceful = async () => {
        logger.info('Shutting down opiniones service...');
        await consumer.close();
        server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
        });
    };

    process.on('SIGINT', graceful);
    process.on('SIGTERM', graceful);
})();
