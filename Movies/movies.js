
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();

const PORT = process.env.PORT || 3003;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/moviesdb';


// fallback sample dataset if DB isn't available
const sampleMovies = [
	{ _id: 'fallback-1', title: 'The Great Train Robbery', year: 1903, plot: 'A group of bandits stage a brazen train hold-up and are pursued by a posse.' },
	{ _id: 'fallback-2', title: 'The Kid', year: 1921, plot: 'A tramp cares for an abandoned child; their relationship is tested.' }
];

let dbClient;
let moviesColl;

async function connectToDb() {
	if (moviesColl) return moviesColl;
	try {
		dbClient = new MongoClient(MONGO_URL);
		await dbClient.connect();
		const db = dbClient.db(); // driver will use DB from connection string if provided
		moviesColl = db.collection('movies');
		console.log('Connected to MongoDB');
		return moviesColl;
	} catch (err) {
		console.warn('Could not connect to MongoDB:', err.message);
		moviesColl = null;
		return null;
	}
}

// Utility to map DB movie doc to a simpler response shape
function mapMovieDoc(doc) {
	if (!doc) return null;
	return {
		_id: doc._id,
		title: doc.title,
		year: doc.year && (doc.year.$numberInt ? parseInt(doc.year.$numberInt, 10) : doc.year) || doc.year,
		plot: doc.plot || doc.fullplot || null,
		imdb: doc.imdb || null,
		genres: doc.genres || null
	};
}

// GET /movies?limit=5
app.get('/movies', async (req, res) => {
	try {
		const limitParam = req.query.limit;
		let limit = limitParam ? Math.max(0, parseInt(limitParam, 10) || 0) : 0;

		const coll = await connectToDb();
		if (!coll) {
			const out = limit > 0 ? sampleMovies.slice(0, limit) : sampleMovies;
			return res.json(out.map(mapMovieDoc));
		}

		const cursor = coll.find({}).sort({ title: 1 });
		if (limit > 0) cursor.limit(limit);
		const docs = await cursor.toArray();
		res.json(docs.map(mapMovieDoc));
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// GET /movies/:id
// If :id is a 24-char hex string, try ObjectId on _id. Otherwise, try numeric imdb.id.
app.get('/movies/:id', async (req, res) => {
	try {
		const raw = req.params.id;
		const coll = await connectToDb();
		// fallback behavior: if DB unavailable, try sampleMovies
		if (!coll) {
			// try numeric match on fallback data
			const num = parseInt(raw, 10);
			if (!Number.isNaN(num)) {
				const found = sampleMovies.find((m) => m.imdb && m.imdb.id === num) || sampleMovies.find((m) => m.id === num);
				if (found) return res.json(mapMovieDoc(found));
			}
			const found = sampleMovies.find((m) => String(m._id) === raw || String(m.id) === raw);
			if (found) return res.json(mapMovieDoc(found));
			return res.status(404).json({ error: 'movie not found (fallback)' });
		}

		let doc = null;
		// try ObjectId
		if (/^[0-9a-fA-F]{24}$/.test(raw)) {
			try {
				doc = await coll.findOne({ _id: new ObjectId(raw) });
			} catch (e) {
				// ignore
			}
		}

		// if not found by _id, try numeric imdb.id
		if (!doc) {
			const num = parseInt(raw, 10);
			if (!Number.isNaN(num)) {
				doc = await coll.findOne({ 'imdb.id': num });
			}
		}

		if (!doc) return res.status(404).json({ error: 'movie not found' });
		res.json(mapMovieDoc(doc));
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// root handler: support ?id=<n> (backwards compatibility)
app.get('/', async (req, res) => {
	const idParam = req.query.id;
	if (!idParam) return res.redirect('/movies');
	// delegate to /movies/:id handler logic
	req.params.id = String(idParam);
	return app._router.handle(req, res, null);
});

process.on('SIGINT', async () => {
	if (dbClient) await dbClient.close();
	process.exit(0);
});

app.listen(PORT, () => {
	console.log(`Movies service listening on http://localhost:${PORT}`);
});

module.exports = app;
