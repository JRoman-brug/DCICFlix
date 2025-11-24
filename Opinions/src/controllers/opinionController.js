const { Opinion, MovieStats } = require('../models/Opinion');
const pino = require('pino');
const axios = require('axios');
const logger = pino();

const onMessage = async (payload) => {
    const { ratingId, userId, userMail, movieId, score, comment, createdAt } = payload;

    // Si no viene userMail en el payload intentamos resolverlo desde el servicio Users
    let resolvedUserMail = userMail;
    if (!resolvedUserMail && userId) {
        try {
            const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || 'http://users:3000';
            const url = `${USERS_SERVICE_URL}/user/${encodeURIComponent(userId)}`;
            const resp = await axios.get(url, { timeout: 3000 });
            const udata = resp.data || {};
            if (udata.email) resolvedUserMail = String(udata.email);
        } catch (e) {
            // no hacemos nada, fallback será cadena vacía
            logger.debug({ err: e.message || e }, 'No se pudo resolver email desde Users');
        }
    }
    
    const existing = await Opinion.findOne({ ratingId });
    if (existing) {
        logger.info({ ratingId }, 'Rating ya procesado (idempotencia)');
        return;
    }

    const op = new Opinion({
        ratingId,
        userId,
        userMail: resolvedUserMail || '',
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
