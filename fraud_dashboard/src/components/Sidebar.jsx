import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import logo from "../assets/1-removebg-preview.png";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [userLoaded, setUserLoaded] = useState(false);

    useEffect(() => {
        api.get("/me/")
            .then(res => {
                setUser(res.data);
                setUserLoaded(true);
            })
            .catch((err) => {
                console.error("Failed to fetch user info in sidebar", err);
                setUserLoaded(true);
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

    const linkStyle = (path) => ({
        display: "block",
        padding: "10px 12px",
        borderRadius: "8px",
        marginBottom: "6px",
        color: isActive(path) ? "#473C33" : "#e8e0d5",
        background: isActive(path) ? "#FEC868" : "transparent",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: "600",
        transition: "background 0.2s, color 0.2s"
    });

    return (
        <div style={{
            width: "150px",
            background: "#473C33",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            padding: "15px",
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 1000,
            boxShadow: "4px 0 12px rgba(71,60,51,0.2)"
        }}>
            <div style={{ marginBottom: "30px", textAlign: "center" }}>
                <img
                    src={logo}
                    alt="Fraudify"
                    style={{ width: "100px", height: "auto", objectFit: "contain" }}
                />
            </div>

            <div style={{ flex: 1 }}>
                {/* Show admin links when: still loading, /me/ failed (user null), or user is staff; hide only when we know user is not staff */}
                {(!userLoaded || (user !== null ? user.is_staff : true)) && (
                    <>
                        <Link to="/dashboard" style={linkStyle("/dashboard")}>
                            Dashboard
                        </Link>
                        <Link to="/manual-review" style={linkStyle("/manual-review")}>
                            Manual Review
                        </Link>
                        <Link to="/audit-logs" style={linkStyle("/audit-logs")}>
                            Audit Logs
                        </Link>
                    </>
                )}
                <Link to="/user-view" style={linkStyle("/user-view")}>
                    User View
                </Link>
            </div>

            <button
                onClick={handleLogout}
                style={{
                    background: "#FDA769",
                    color: "#473C33",
                    border: "none",
                    padding: "10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    marginTop: "auto",
                    fontSize: "13px"
                }}
            >
                Log Out
            </button>
        </div>
    );
}
