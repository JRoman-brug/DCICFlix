const mongoose = require('mongoose');
const pino = require('pino');
const logger = pino();

const connect = async (mongoUrl) => {
    mongoose.set('strictQuery', true);
    try {
        await mongoose.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
        });
        logger.info('MongoDB conectado');
    } catch (err) {
        logger.error({ err }, 'Error conectando a MongoDB');
        throw err;
    }
};
module.exports = { connect };
