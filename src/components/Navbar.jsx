import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Navbar() {
    const { user, logout } = useAuth();

    const linkStyle = {
        color: "white",
        textDecoration: "none",
        padding: "0.4rem 0.8rem",
        border: "1px solid white",
        borderRadius: "6px",
        transition: "background 0.3s",
    };

    const linkHoverStyle = {
        background: "white",
        color: "#333",
    };

    return (
        <nav
            style={{
                padding: "1rem",
                background: "#333",
                color: "white",
                display: "flex",
                alignItems: "center",
            }}
        >
            <div style={{ display: "flex", gap: "1rem" }}>
                <Link to="/" style={linkStyle}>
                    Home
                </Link>
                {user && (
                    <Link to="/todo" style={linkStyle}>
                        My Todos
                    </Link>
                )}
            </div>

            <div
                style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                }}
            >
                {user ? (
                    <>
                        <span>hallo, {user.name} !</span>
                        <button
                            onClick={logout}
                            style={{
                                ...linkStyle,
                                background: "none",
                                cursor: "pointer",
                            }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" style={linkStyle}>
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
