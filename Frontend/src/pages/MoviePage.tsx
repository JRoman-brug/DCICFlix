import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Film, Star, UserCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/authContext";

export const MoviePage = () => {
    const { id } = useParams();

    const [movie, setMovie] = useState<any>(null);
    const [opinions, setOpinions] = useState<any[]>([]);
    const [average, setAverage] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const loaderRef = useRef<HTMLDivElement | null>(null);

    const [userRating, setUserRating] = useState<number>(0);
    const [userComment, setUserComment] = useState("");
    const { user, isAuthenticated } = useAuth();
    const [hasUserOpinion, setHasUserOpinion] = useState(false);

    // Poster fallback handling (igual que MovieCard)
    const [posterError, setPosterError] = useState(false);
    const [showFallback, setShowFallback] = useState(false);

    const POSTER_HEIGHT_PX = 460;

    // Determinar si el poster existe
    const hasPoster =
        movie?.poster && movie.poster.trim() !== "" && !posterError;

    useEffect(() => {
        if (!hasPoster) {
            const timer = setTimeout(() => setShowFallback(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [hasPoster]);

    // Load movie + opinions
    useEffect(() => {
        const loadMovie = async () => {
            try {
                const res = await fetch(`http://localhost:3002/movies/${id}`);
                const data = await res.json();
                setMovie(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const loadOpinions = async () => {
            try {
                const res = await fetch(`http://localhost:3002/opinions/movie/${id}`);
                const data = await res.json();
                setPage(1);
                setOpinions(data.opinions || []);
                setAverage(data.stats?.avgScore ?? null);
                // comprobar si el usuario actual ya dejó una opinión
                try {
                    const uid = user?.id;
                    const uemail = user?.email;
                    let has = false;
                    if (uid) has = (data.opinions || []).some((o: any) => o.userId === uid);
                    else if (uemail) has = (data.opinions || []).some((o: any) => o.userMail === uemail);
                    setHasUserOpinion(Boolean(has));
                } catch (e) {
                    setHasUserOpinion(false);
                }
            } catch (err) {
                console.error(err);
            }
        };

        loadMovie();
        loadOpinions();
    }, [id]);

    const loadMoreOpinions = useCallback(async () => {
        if (loadingMore) return;

        setLoadingMore(true);

        try {
            const res = await fetch(
                `http://localhost:3002/opinions/movie/${id}?page=${page + 1}`
            );
            const data = await res.json();

            if (data.opinions?.length) {
                setOpinions((prev) => [...prev, ...data.opinions]);
                setPage((p) => p + 1);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingMore(false);
        }
    }, [page, id, loadingMore]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMoreOpinions();
            },
            { threshold: 0.4 }
        );

        if (loaderRef.current && opinions.length > 0)  {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [loadMoreOpinions]);

    const toggleRating = (n: number) => {
        setUserRating((prev) => (prev === n ? 0 : n));
    };

    const submitOpinion = async () => {
        if (!userComment.trim()) return;

        if (!isAuthenticated) {
            console.warn('Usuario no autenticado. Login requerido para enviar opinión.');
            return;
        }

        if (hasUserOpinion) {
            console.warn('Ya existe una opinión de este usuario para esta película.');
            return;
        }

        const body = {
            movieId: id,
            score: userRating,
            comment: userComment,
        };

        try {
            const token = localStorage.getItem('jwt_token');
            await fetch(`http://localhost:3002/ratings`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });

            const res = await fetch(`http://localhost:3002/opinions/movie/${id}`);
            const data = await res.json();

            setOpinions(data.opinions || []);
            setAverage(data.stats?.avgScore ?? null);

            setUserRating(0);
            setUserComment("");
            setPage(1);
            setHasUserOpinion(true);
        } catch (err) {
            console.error(err);
        }
    };

    const getDisplayName = (op: any) => {
        if (!op) return 'User';
        const email = op.userMail || (typeof op.username === 'string' && op.username.includes('@') ? op.username : undefined) || (typeof op.user === 'string' && op.user.includes('@') ? op.user : undefined);
        if (email) {
            const s = String(email).trim();
            const at = s.indexOf('@');
            if (at > 0) return s.substring(0, at);
            return s.split(' ')[0];
        }

        if (op.username && typeof op.username === 'string') {
            const uname = op.username.trim();
            if (!/^[0-9a-fA-F]{24}$/.test(uname)) return uname;
        }
        return 'User';
    };

    if (loading) {
        return (
            <div className="bg-black min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-zinc-400 animate-spin" />
                </div>
            </div>
        );
    }

    if (!movie) {
        return (
            <>
                <Navbar />
                <div className="text-center text-red-400 py-10">Movie not found</div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            {/* HEADER WITHOUT BORDER + BIGGER GRADIENT */}
            <div className="relative w-full">
                {movie.backdrop ? (
                    <img
                        src={movie.backdrop}
                        alt="Backdrop"
                        className="w-full h-full object-cover opacity-40"
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-900"></div>
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-transparent" />
            </div>

            <div className="min-h-screen bg-black text-white px-6 py-8 max-w-6xl mx-auto">

                {/* BACK */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.28 }}
                >
                                <BackButton />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                    {/* POSTER */}
                    <motion.div
                        className="md:col-span-1 flex flex-col items-center"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                    >
                        <div
                            className="w-full rounded-xl border border-zinc-800 shadow-lg bg-zinc-950 overflow-hidden flex items-center justify-center"
                            style={{ height: POSTER_HEIGHT_PX }}
                        >
                            {/* Poster normal */}
                            {hasPoster && (
                                <img
                                    src={movie.poster}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                    onError={() => setPosterError(true)}
                                />
                            )}

                            {/* Fallback */}
                            {!hasPoster && (
                                <div className="flex flex-col items-center justify-center w-full h-full">
                                    {!showFallback ? (
                                        <Film className="w-14 h-14 text-zinc-600 animate-spin motion-safe:animate-pulse" />
                                    ) : (
                                        <div className="flex flex-col items-center text-zinc-600">
                                            <Film className="w-20 h-20 opacity-80" />
                                            <span className="text-sm mt-2 opacity-70">
                                                No image
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* YEAR, GENRES, AVG */}
                        <div className="mt-4 w-full text-center">
                            <p className="text-zinc-400 text-sm">{movie.year}</p>

                            <div className="flex flex-wrap justify-center gap-2 mt-2">
                                {movie.genres?.map((g: string) => (
                                    <span
                                        key={g}
                                        className="px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-200"
                                    >
                                        {g}
                                    </span>
                                ))}
                            </div>

                            {average !== null && (
                                <div className="flex items-center justify-center gap-2 mt-3">
                                    <Star className="w-5 h-5 text-yellow-400" />
                                    <span className="text-lg">{average.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* RIGHT SIDE */}
                    <motion.div
                        className="md:col-span-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.45 }}
                    >
                        <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>

                        <p className="text-zinc-300 leading-relaxed mb-8 whitespace-pre-wrap text-sm">
                            {movie.plot}
                        </p>

                        <div className="border-t border-zinc-800 mb-6" />

                        {/* LEAVE OPINION */}
                        <h2 className="text-xl font-semibold mb-3">Leave your opinion</h2>

                        <div className="flex items-start gap-4 mb-6">
                            <UserCircle2 className="w-10 h-10 text-zinc-500" />

                            <div className="flex-1">
                                {!isAuthenticated ? (
                                    <div className="text-sm text-zinc-400 mb-3">
                                        You must <Link to="/login" className="text-dcicflix">log in</Link> to leave an opinion.
                                    </div>
                                ) : hasUserOpinion ? (
                                    <div className="text-sm text-zinc-400 mb-3">You have already left an opinion for this movie.</div>
                                ) : null}
                                {/* Stars */}
                                <div className="flex gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <button key={n} onClick={() => toggleRating(n)}>
                                            <Star
                                                className={`w-6 h-6 transition ${
                                                    n <= userRating
                                                        ? "text-yellow-400"
                                                        : "text-zinc-600"
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    value={userComment}
                                    onChange={(e) => setUserComment(e.target.value)}
                                    placeholder="Write your thoughts…"
                                    className="w-full bg-transparent text-sm text-zinc-200 outline-none resize-none placeholder:text-zinc-500 h-24"
                                />

                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={submitOpinion}
                                        disabled={!userComment.trim()}
                                        className={`py-2 px-4 rounded-lg font-semibold transition ${
                                            userComment.trim()
                                                ? "bg-white text-black hover:bg-zinc-200"
                                                : "bg-zinc-900 text-zinc-600 cursor-not-allowed"
                                        }`}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-zinc-800 mb-4" />

                        {/* OPINIONS */}
                        <h2 className="text-xl font-semibold mb-4">Opinions</h2>

                        <div className="max-h-[300px] overflow-y-auto pr-3 space-y-4">
                            {opinions.length === 0 ? (
                                <p className="text-zinc-500">No opinions yet.</p>
                            ) : (
                                opinions.map((op, i) => (
                                    <div
                                        key={i}
                                        className="flex gap-3 pb-4 border-b border-zinc-900"
                                    >
                                        <UserCircle2 className="w-10 h-10 text-zinc-500" />

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-zinc-200 font-medium">
                                                {getDisplayName(op)}
                                            </span>

                                                <div className="flex gap-1">
                                                    {Array.from({ length: op.score || 0 }).map(
                                                        (_, idx) => (
                                                            <Star
                                                                key={idx}
                                                                className="w-4 h-4 text-yellow-400"
                                                            />
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-sm text-zinc-300 mt-1">
                                                {op.comment}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}

                            <div
                                ref={loaderRef}
                                className="h-10 flex items-center justify-center text-zinc-500"
                            >
                                {loadingMore && "Loading more…"}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default MoviePage;

// BackButton component used inside MoviePage
function BackButton() {
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as any)?.from;

    const goBack = () => {
        if (from) navigate(from);
        else navigate(-1);
    };

    return (
        <button onClick={goBack} className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back
        </button>
    );
}
