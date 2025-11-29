import { Navbar } from "../components/Navbar";
import RecomendationsGrid from "../components/RecomendationsGrid";
import { useAuth } from "../context/authContext";
import { Link } from "react-router-dom";

function Recomendations() {
  const { isAuthenticated, user } = useAuth();
  return (
    <>
      <Navbar />
      {!isAuthenticated ? (
        <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-white text-lg font-semibold mb-2">You can't see recommendations</h2>
            <p className="text-zinc-400 mb-4">You must log in to see personalized recommendations.</p>
            <Link to="/login" className="text-red-500 font-semibold hover:underline">Log in</Link>
          </div>
        </div>
      ) : (
        <RecomendationsGrid userId={user?.id} />
      )}
    </>
  );
}

export default Recomendations;
