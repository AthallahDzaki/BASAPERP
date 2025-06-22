import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function LoginPage() {
    const [username, setUsername] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = () => {
        if (!username.trim()) return;
        login(username);
        navigate("/todo");
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={{ marginBottom: "1rem", color: "#2c3e50" }}>
                    Login
                </h2>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={inputStyle}
                />
                <button onClick={handleLogin} style={buttonStyle}>
                    Login
                </button>
            </div>
        </div>
    );
}

const containerStyle = {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
};

const cardStyle = {
    background: "white",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    width: "300px",
    alignItems: "center",
    border: "2px solid #2980b9",
};

const inputStyle = {
    padding: "0.5rem",
    width: "100%",
    marginBottom: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "1rem",
};

const buttonStyle = {
    padding: "0.6rem 1.2rem",
    width: "100%",
    backgroundColor: "#2980b9",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "1rem",
    cursor: "pointer",
};

export default LoginPage;
