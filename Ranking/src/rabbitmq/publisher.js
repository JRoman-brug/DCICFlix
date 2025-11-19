const amqplib = require('amqplib');
const pino = require('pino');
const logger = pino();

class RabbitPublisher {
    constructor(url, exchange, exchangeType = 'topic') {
        this.url = url;
        this.exchange = exchange;
        this.exchangeType = exchangeType;
        this.connection = null;
        this.channel = null; 
        this.reconnectDelay = 1000; 
        this.maxReconnectDelay = 30000;
        this.isClosing = false;
    }

    async init() {
        await this._connectWithRetry();
    }

    async _connectWithRetry() {
        while (!this.isClosing) {
        try {
            this.connection = await amqplib.connect(this.url);
            this.connection.on('error', (err) => {
            logger.error({ err }, 'RabbitMQ connection error');
        });
        this.connection.on('close', () => {
            logger.warn('RabbitMQ connection closed, retrying...');
            if (!this.isClosing) {
                setTimeout(() => this._connectWithRetry(), this.reconnectDelay);
                this.reconnectDelay = Math.min(this.maxReconnectDelay, this.reconnectDelay * 2);
            }
        });

        this.channel = await this.connection.createConfirmChannel();
        await this.channel.assertExchange(this.exchange, this.exchangeType, { durable: true });
        logger.info('RabbitMQ publisher ready');
        this.reconnectDelay = 1000;
        break;
        } catch (err) {
            logger.error({ err }, `Error conectando a RabbitMQ. Reintentando en ${this.reconnectDelay}ms`);
            await new Promise(res => setTimeout(res, this.reconnectDelay));
            this.reconnectDelay = Math.min(this.maxReconnectDelay, this.reconnectDelay * 2);
        }
        }
    }

    async publish(routingKey, payload) {
        if (!this.channel) {
        throw new Error('Channel no inicializado');
        }
        const msg = Buffer.from(JSON.stringify(payload));
        return new Promise((resolve, reject) => {
        this.channel.publish(this.exchange, routingKey, msg, { persistent: true }, (err, ok) => {
        if (err) {
            logger.error({ err }, 'Publish error');
            return reject(err);
            }
            resolve(ok);
        });
        });
    }

    async close() {
        this.isClosing = true;
        try {
        if (this.channel) await this.channel.close();
        if (this.connection) await this.connection.close();
        logger.info('RabbitMQ publisher cerrado');
        } catch (err) {
        logger.warn({ err }, 'Error cerrando RabbitMQ');
        }
    }
}

module.exports = RabbitPublisher;
