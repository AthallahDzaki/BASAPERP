import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import TodoPage from "./pages/TodoPage";
import { useAuth } from "./auth/AuthContext";

function App() {
    const { user } = useAuth();

    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/todo"
                    element={user ? <TodoPage /> : <Navigate to="/login" />}
                />
            </Routes>
        </>
    );
}
export default App;
