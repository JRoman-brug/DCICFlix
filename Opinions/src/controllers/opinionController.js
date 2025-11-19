const { Opinion, MovieStats } = require('../models/Opinion');
const pino = require('pino');
const logger = pino();

const onMessage = async (payload) => {
    const { ratingId, userId, movieId, score, comment, createdAt } = payload;
    
    const existing = await Opinion.findOne({ ratingId });
    if (existing) {
        logger.info({ ratingId }, 'Rating ya procesado (idempotencia)');
        return;
    }

    const op = new Opinion({
        ratingId,
        userId,
        movieId,
        score,
        comment,
        createdAt: createdAt ? new Date(createdAt) : new Date()
    });
    await op.save();

    const updated = await MovieStats.findOneAndUpdate(
        { movieId },
        { $inc: { count: 1, sumScore: score }, $setOnInsert: { movieId } },
        { upsert: true, new: true }
    );

    updated.avgScore = updated.sumScore / updated.count;
    await updated.save();

    logger.info({ movieId, ratingId }, 'Opinion almacenada y stats actualizadas');
};

module.exports = { onMessage };
