import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
<<<<<<< HEAD
import Home from "./pages/Home"; 
import { MoviePage } from "./pages/MoviePage";
=======
import Home from "./pages/Home";
>>>>>>> 664a76b3cd170383c4c0ab53ffe18bb97da9ecf2

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/movie/:id" element={<MoviePage />} />

        {/* Home principal */}
        <Route path="/" element={<Home />} />

        {/* path es la URL, element es el componente a renderizar */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<h1>ENANO MOGOLICO</h1>} />

        {/* Ruta comodín (*) para manejar errores 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
