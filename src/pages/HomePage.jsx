import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function HomePage() {
    const { user } = useAuth();

    return (
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <h1 style={{ fontSize: "2.5rem", color: "#2c3e50" }}>
                React Todo App
            </h1>
            <p
                style={{
                    fontSize: "1.2rem",
                    maxWidth: "600px",
                    margin: "1rem auto",
                    lineHeight: "1.6",
                }}
            >
                Aplikasi Todo sederhana berbasis <strong>React</strong> yang
                memungkinkan kamu mencatat dan mengatur aktivitas harian secara
                cepat dan mudah. Dilengkapi fitur login dan pencatatan waktu
                otomatis.
            </p>

            {user ? (
                <Link to="/todo">
                    <button style={buttonStyle}>Lihat Daftar Todo</button>
                </Link>
            ) : (
                <Link to="/login">
                    <button style={buttonStyle}>Login untuk Mulai</button>
                </Link>
            )}
        </div>
    );
}

const buttonStyle = {
    padding: "0.8rem 1.5rem",
    backgroundColor: "#2980b9",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    cursor: "pointer",
};

export default HomePage;
