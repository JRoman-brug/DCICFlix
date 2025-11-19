const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    movieId: { type: String, required: true, index: true },
    score: { type: Number, required: true, min: 0, max: 10 },
    comment: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

//(movieId + score)
RatingSchema.index({ movieId: 1, createdAt: -1 });

module.exports = mongoose.model('Ranking', RatingSchema);
