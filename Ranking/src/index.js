require('dotenv').config();
const pino = require('pino');
const logger = pino();
const app = require('./app');
const { connect } = require('./config/mongoose');
const RabbitPublisher = require('./rabbitmq/publisher');
const { setPublisher } = require('./controllers/ratingController');

const PORT = process.env.PORT || 4000;
const MONGO_URL = process.env.MONGO_URL;
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const RABBITMQ_EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'ratings';
const RABBITMQ_EXCHANGE_TYPE = process.env.RABBITMQ_EXCHANGE_TYPE || 'topic';

(async () => {
    try {
        await connect(MONGO_URL);
    } catch (err) {
        logger.error('No se pudo conectar a MongoDB. Saliendo.');
        process.exit(1);
    }

    // inicializar publisher
    const publisher = new RabbitPublisher(RABBITMQ_URL, RABBITMQ_EXCHANGE, RABBITMQ_EXCHANGE_TYPE);
    await publisher.init();
    setPublisher(publisher);

    const server = app.listen(PORT, () => {
        logger.info(`Calificacion service escuchando en ${PORT}`);
    });

    const graceful = async () => {
        logger.info('Shutting down calificacion service');
        await publisher.close();
        server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
        });
    };

    process.on('SIGINT', graceful);
    process.on('SIGTERM', graceful);
})();
