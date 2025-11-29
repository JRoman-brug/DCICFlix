import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { Link } from "react-router-dom";
import { UserCircle2, Star, Trash2 } from "lucide-react";
import { Navbar } from "../components/Navbar";
import ConfirmModal from "../components/modals/RemoveModal"; 

interface Opinion {
    _id: string;
    movieId: string;
    score: number;
    comment: string;
    createdAt: string;
}

const Profile = () => {
    const { user, isAuthenticated } = useAuth();
    const [opinions, setOpinions] = useState<Opinion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        if (!user?.id) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `http://localhost:3002/opinions/user/${encodeURIComponent(user.id)}`
            );

            if (!res.ok) {
                const text = await res.text();
                console.error("Opinions fetch failed", res.status, text);
                setError(`Error loading opinions: ${res.status}`);
                setOpinions([]);
                return;
            }

            const data = await res.json();
            setOpinions(data.opinions || []);
        } catch (err) {
            console.error(err);
            setError("Error loading opinions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) void load();
    }, [isAuthenticated]);

    const countsByStar = opinions.reduce((acc: Record<number, number>, op) => {
        acc[op.score] = (acc[op.score] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const usernameOnly = user?.email ? String(user.email).split("@")[0] : "User";

    const deleteOpinion = async (opId: string) => {
        try {
            const token = localStorage.getItem("jwt_token");
            const res = await fetch(
                `http://localhost:3002/opinions/${encodeURIComponent(opId)}`,
                {
                    method: "DELETE",
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                }
            );

            if (!res.ok) throw new Error("delete failed");
            await load();
        } catch (err) {
            console.error(err);
            alert("No se pudo borrar la opinión");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">Log in</h2>
                    <p className="text-zinc-400 mb-4">You must log in to view your profile.</p>
                    <Link to="/login" className="text-dcicflix font-semibold">
                        Go to login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <div className="px-6 py-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    
                    {/* LEFT CARD */}
                    <aside className="md:col-span-2 bg-zinc-900 p-6 rounded-lg flex flex-col items-center gap-6 self-start h-full max-h-[600px]">
                        <div className="flex flex-col items-center w-full">
                            <div className="w-32 h-32 rounded-full bg-zinc-800 flex items-center justify-center">
                                <UserCircle2 className="w-20 h-20 text-zinc-400" />
                            </div>
                            <div className="mt-3 text-center">
                                <div className="text-2xl font-bold">{usernameOnly}</div>
                                <div className="text-sm text-zinc-400">{user?.email}</div>
                            </div>
                        </div>

                        <div className="w-full">
                            <h4 className="text-sm text-zinc-300 mb-3">Stats</h4>
                            <div className="flex flex-col gap-2">
                                {[5, 4, 3, 2, 1].map((s) => (
                                    <div
                                        key={s}
                                        className="flex items-center justify-between bg-zinc-800 p-3 rounded-md"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded bg-zinc-900">
                                                <Star className="w-4 h-4 text-yellow-400" />
                                            </div>
                                            <span className="text-sm font-semibold">{s}</span>
                                        </div>
                                        <div className="text-sm text-zinc-300">
                                            {countsByStar[s] || 0}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* RIGHT SIDE: OPINIONS */}
                    <section className="md:col-span-2 bg-zinc-900 p-6 rounded-lg h-full max-h-[600px] overflow-y-auto">
                        <h3 className="text-xl font-semibold mb-4">Your opinions</h3>

                        {loading && <div className="text-zinc-400">Loading...</div>}
                        {error && <div className="text-red-400">{error}</div>}
                        {!loading && opinions.length === 0 && (
                            <div className="text-zinc-400">You have no opinions yet.</div>
                        )}

                        <div className="space-y-4 pb-4">
                            {opinions.map((op) => (
                                <div
                                    key={op._id}
                                    className="p-4 bg-zinc-800 rounded-md flex gap-4"
                                >
                                    <div>
                                        <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center">
                                            <UserCircle2 className="w-6 h-6 text-zinc-400" />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="text-sm font-medium text-white">
                                                    {usernameOnly}
                                                </div>
                                                <div className="text-xs text-zinc-500">
                                                    {new Date(op.createdAt).toLocaleString()}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex gap-1">
                                                    {Array.from({ length: op.score }).map((_, idx) => (
                                                        <Star
                                                            key={idx}
                                                            className="w-4 h-4 text-yellow-400"
                                                        />
                                                    ))}
                                                </div>

                                                <ConfirmModal
                                                    message="Are you sure you want to delete this opinion? This action cannot be undone."
                                                    buttonContent={
                                                        <Trash2 className="w-4 h-4 text-red-400 hover:opacity-80 cursor-pointer" />
                                                    }
                                                    handler={() => deleteOpinion(op._id)}
                                                />
                                            </div>
                                        </div>

                                        <div className="text-sm text-zinc-300 mt-2">
                                            {op.comment}
                                        </div>
                                        <div className="mt-2">
                                            <Link
                                                to={`/movie/${op.movieId}`}
                                                className="text-dcicflix text-sm hover:underline"
                                            >
                                                View movie
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Profile;
