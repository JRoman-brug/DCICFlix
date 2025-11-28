const axios = require('axios');

const OPINIONS_SERVICE_URL = process.env.OPINIONS_SERVICE_URL || 'http://opiniones:4100';

async function getMovieOpinions(req, res) {
    const { movieId } = req.params;

    try {
        // Call the Opinions service for the movie
        const url = `${OPINIONS_SERVICE_URL}/api/opinions/movie/${encodeURIComponent(movieId)}`;
        const resp = await axios.get(url, { timeout: 5000 });
        const { opinions = [], stats = null } = resp.data || {};

        // If opinions are provided, compute average score if not present in stats
        let average = null;
        if (stats && typeof stats.average !== 'undefined') {
            average = stats.average;
        } else if (Array.isArray(opinions) && opinions.length > 0) {
            const scores = opinions.map(o => (o.score != null ? Number(o.score) : NaN)).filter(n => !Number.isNaN(n));
            if (scores.length > 0) {
                average = scores.reduce((a, b) => a + b, 0) / scores.length;
            }
        }

        // Enrich opinions with username (prefix before @) by querying User service
        if (Array.isArray(opinions) && opinions.length > 0) {
            const uniqueUserIds = [...new Set(opinions.map(o => o.userId).filter(Boolean))];
            const userMap = {};
            await Promise.all(uniqueUserIds.map(async (uid) => {
                try {
                    const uresp = await axios.get(`${USERS_SERVICE_URL}/user/${encodeURIComponent(uid)}`, { timeout: 3000 });
                    const udata = uresp.data || {};
                    if (udata.email) userMap[uid] = String(udata.email).split('@')[0];
                } catch (e) {
                    // ignore errors; fallback will be userId
                }
            }));

            // attach username to each opinion
            opinions.forEach(o => {
                if (o.userId && userMap[o.userId]) o.username = userMap[o.userId];
                else if (o.userId) o.username = String(o.userId).split('@')[0] || String(o.userId);
                else o.username = 'unknown';
            });
        }

        return res.json({ movieId, opinions, average, stats });
    } catch (err) {
        console.error('Error fetching from Opinions service', err.message || err);
        const status = err.response ? err.response.status : 502;
        return res.status(status).json({ error: 'No se pudo obtener opiniones desde el servicio de opiniones' });
    }
}

module.exports = { getMovieOpinions };
