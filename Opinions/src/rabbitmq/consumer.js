const amqplib = require('amqplib');
const pino = require('pino');
const logger = pino();

const processMessage = async (msg, handlers) => {
    const content = msg.content.toString();
    let payload;
    try {
        payload = JSON.parse(content);
    } catch (err) {
        logger.error({ err }, 'Mensaje inválido JSON -> nack sin requeue');
        return { action: 'nack_no_requeue' };
    }

    try {
        await handlers.onMessage(payload);
        return { action: 'ack' };
    } catch (err) {
    logger.error({ err }, 'Error procesando mensaje');
    const headers = msg.properties.headers || {};
    const retries = (headers['x-retries'] || 0) + 1;
    if (retries > 5) {
        logger.warn({ retries }, 'Max retries alcanzado -> nack sin requeue');
        return { action: 'nack_no_requeue' };
        } else {
        logger.info({ retries }, 'Reintentando mensaje -> nack con requeue=true');
        return { action: 'nack_requeue', retries };
        }
    }
};

class RabbitConsumer {
    constructor(url, exchange, queueName, routingKey = 'rating.created', exchangeType = 'topic') {
        this.url = url;
        this.exchange = exchange;
        this.queueName = queueName;
        this.routingKey = routingKey;
        this.exchangeType = exchangeType;
        this.conn = null;
        this.channel = null;
        this.handlers = null;
    }

    async init(handlers) {
        this.handlers = handlers;
        this.conn = await amqplib.connect(this.url);
        this.conn.on('error', err => logger.error({ err }, 'Rabbit consumer connection error'));
        this.conn.on('close', () => logger.warn('Rabbit consumer connection closed'));

        this.channel = await this.conn.createChannel();
        await this.channel.assertExchange(this.exchange, this.exchangeType, { durable: true });
        await this.channel.assertQueue(this.queueName, { durable: true });
        await this.channel.bindQueue(this.queueName, this.exchange, this.routingKey);

        await this.channel.prefetch(10);

        logger.info('Rabbit consumer listo, escuchando mensajes');

        this.channel.consume(this.queueName, async (msg) => {
        if (!msg) return;
        const result = await processMessage(msg, this.handlers);
        if (result.action === 'ack') {
            this.channel.ack(msg);
        } else if (result.action === 'nack_no_requeue') {
            this.channel.nack(msg, false, false);
        } else if (result.action === 'nack_requeue') {
            this.channel.nack(msg, false, true);
        }
        }, { noAck: false });
    }

    async close() {
        try {
        if (this.channel) await this.channel.close();
        if (this.conn) await this.conn.close();
        } catch (err) {
        logger.warn({ err }, 'Error cerrando consumer');
        }
    }
}

module.exports = RabbitConsumer;
