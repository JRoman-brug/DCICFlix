import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Home from "./pages/Home"; 
import { MoviePage } from "./pages/MoviePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/movie/:id" element={<MoviePage />} />

        {/* Home principal */}
        <Route path="/" element={<Home />} /> 

        {/* path es la URL, element es el componente a renderizar */}
        <Route path="/login" element={<Login />} />

        {/* Ruta comodín (*) para manejar errores 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
