const { validationResult } = require('express-validator');
const Rating = require('../models/Rating');
const pino = require('pino');
const logger = pino();

let rabbitPublisher = null;

// setter para inyectar dependencia desde index.js
const setPublisher = (publisher) => {
    rabbitPublisher = publisher;
    };

    const createRating = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, movieId, score, comment } = req.body;

    try {
        const rating = new Rating({ userId, movieId, score, comment });
        const saved = await rating.save();

        try {
        await rabbitPublisher.publish('rating.created', {
            ratingId: saved._id.toString(),
            userId,
            movieId,
            score,
            comment,
            createdAt: saved.createdAt
        });
        logger.info({ ratingId: saved._id }, 'Rating publicado en RabbitMQ');
        } catch (err) {
        logger.error({ err, ratingId: saved._id }, 'Error publicando rating en RabbitMQ');
        }

        return res.status(201).json({ id: saved._id, message: 'Rating creado' });
    } catch (err) {
        logger.error({ err }, 'Error al crear rating');
        return res.status(500).json({ error: 'Error interno' });
    }
};

module.exports = { createRating, setPublisher };
