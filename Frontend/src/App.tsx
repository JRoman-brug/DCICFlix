import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
