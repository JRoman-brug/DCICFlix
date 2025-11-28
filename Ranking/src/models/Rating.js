const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    userMail : { type: String, required: false },
    movieId: { type: String, required: true, index: true },
    score: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

// índice para consultas por película y orden descendente por fecha
RatingSchema.index({ movieId: 1, createdAt: -1 });

// Asegura que un mismo usuario solo pueda valorar una vez cada película
RatingSchema.index({ userId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Ranking', RatingSchema);
