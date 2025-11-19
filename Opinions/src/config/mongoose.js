const mongoose = require('mongoose');
const pino = require('pino');
const logger = pino();

const connect = async (mongoUri) => {
    mongoose.set('strictQuery', true);
    try {
        await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
        });
        logger.info('MongoDB (opiniones) conectado');
    } catch (err) {
        logger.error({ err }, 'Error conectando a MongoDB (opiniones)');
        throw err;
    }
};

module.exports = { connect };
