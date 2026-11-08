import { NavLink } from "react-router-dom";

export default function Navbar() {
    const classe = ({ isActive }) => (isActive ? "ativo" : "");

    return (
        <header className="navbar">
            <span className="marca">📍 Onde Tem?</span>
            <nav>
                <NavLink to="/" end className={classe}>
                    Mapa
                </NavLink>
                <NavLink to="/cadastro" className={classe}>
                    Cadastrar
                </NavLink>
                <NavLink to="/gerenciar" className={classe}>
                    Gerenciar
                </NavLink>
            </nav>
        </header>
    );
}