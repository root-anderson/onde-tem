import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import MapaPage from "./pages/MapaPage.jsx";
import CadastroPage from "./pages/CadastroPage.jsx";
import GerenciarPage from "./pages/GerenciarPage.jsx";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="conteudo">
        <Routes>
          <Route path="/" element={<MapaPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/gerenciar" element={<GerenciarPage />} />
        </Routes>
      </main>
    </div>
  );
}