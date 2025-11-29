import {
  addToast,
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { LogOutIcon, UserIcon } from "lucide-react";
import dciflixLogo from "../assets/dciflix-logo.png";
import { useAuth } from "../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { searchMovies } from "../services/movies/movies.service";
import type { Movie } from "../types/movie";
import type { User } from "../services/auth/auth.types";
import ConfirmModal from "./modals/ConfirmModal";

const ProfileSection = ({ userData }: { userData: User | null }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await logout();
      addToast({ title: "Logout successfully", color: "success" });
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  if (!userData)
    return (
      <Link to="/login">
        <UserIcon className="cursor-pointer" />
      </Link>
    );

  return (
    <div className="flex items-center gap-3">
      {/* Enlace al perfil */}
      <Link
        to="/profile"
        className="hover:text-dcicflix transition text-sm font-semibold cursor-pointer"
      >
        {userData.email.split("@")[0]}
      </Link>

      {/* Botón Logout (NO está envuelto en un Link) */}
      <ConfirmModal
        title="Are you sure you want to logout?"
        message="Are you sure you want to logout?"
        iconButton={<LogOutIcon size={18} className="text-white cursor-pointer" />}
        handler={onLogout}
      />
    </div>
  );
};

export const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const debounceRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <HeroNavbar
      maxWidth="xl"
      position="static"
      className="bg-black text-white border-b border-zinc-800"
    >
      <NavbarBrand>
        <Link to="/" className="inline-block">
          <img
            src={dciflixLogo}
            alt="DCIFLIX"
            className="h-10 sm:h-12 object-contain cursor-pointer"
          />
        </Link>
      </NavbarBrand>

      <NavbarContent className="ml-0 sm:ml-[-360px]">
        <NavbarItem>
          <div className="relative" ref={containerRef}>
            <input
              type="text"
              name="q"
              placeholder="Search movies..."
              className="bg-zinc-900 text-sm text-white placeholder:text-zinc-500 px-4 py-1 rounded-md w-48"
              value={query}
              onChange={(e) => {
                const v = e.target.value;
                setQuery(v);
                setShowDropdown(true);

                if (debounceRef.current)
                  window.clearTimeout(debounceRef.current);

                debounceRef.current = window.setTimeout(() => {
                  void (async () => {
                    const q = v.trim();
                    if (!q) {
                      setResults([]);
                      setLoading(false);
                      return;
                    }
                    setLoading(true);
                    try {
                      const res = await searchMovies(q);
                      const qlow = q.toLowerCase();
                      const filtered = res.filter((m) =>
                        (m.title || "").toLowerCase().includes(qlow)
                      );
                      setResults(filtered);
                    } catch {
                      setResults([]);
                    } finally {
                      setLoading(false);
                    }
                  })();
                }, 300);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              aria-label="search-movies"
            />

            {showDropdown && (loading || results.length > 0 || query.trim() !== "") && (
              <div className="absolute left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg z-50">
                {loading && (
                  <div className="p-2 text-sm text-zinc-400">Searching...</div>
                )}
                {!loading && results.length === 0 && query.trim() !== "" && (
                  <div className="p-2 text-sm text-zinc-400">No matches</div>
                )}
                {!loading &&
                  results.map((m) => (
                    <Link
                      key={m._id}
                      to={`/movie/${m._id}`}
                      className="block px-3 py-2 hover:bg-zinc-800 text-sm text-white"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="flex justify-between">
                        <span className="truncate">{m.title}</span>
                        <span className="text-zinc-500 ml-2">{m.year}</span>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Link
            to="/recomendations"
            className="text-sm font-semibold text-white hover:text-dcicflix transition"
          >
            recommendations
          </Link>
        </NavbarItem>

        <NavbarItem>
          {}
          <ProfileSection userData={user} />
        </NavbarItem>
      </NavbarContent>
    </HeroNavbar>
  );
};
