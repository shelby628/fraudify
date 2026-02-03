import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setUsername("");
    setPassword("");

    document.body.classList.add('login-page-background');

    return () => {
      document.body.classList.remove('login-page-background');
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("Login function fired"); // ✅ Check if function runs
    console.log("Submitting login for:", username);

    setError("");

    try {
      console.log("Calling API /token/");
      const res = await api.post("/token/", {
        username,
        password,
      });
      console.log("Login response:", res.data);

      // Store token and username
      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("username", username.trim());

      // Fetch user info
      console.log("About to call /me/");
      
      const meRes = await api.get("/me/");

      console.log("ME ENDPOINT RESPONSE:", meRes.data);
      localStorage.setItem("is_staff", meRes.data.is_staff);
      localStorage.setItem("username", meRes.data.username);
      // Redirect based on staff status
      if (meRes.data?.is_staff) {
        console.log("Redirecting to /dashboard");
        navigate("/dashboard");
      } else {
        console.log("Redirecting to /user-view");
          navigate("/user-view");
      }
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "Invalid username or password or network error.";
      setError(errorMessage);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "100px auto",
        padding: "32px",
        background: "linear-gradient(135deg, rgba(171,194,112,0.2) 0%, rgba(254,200,104,0.25) 50%, rgba(253,167,105,0.2) 100%)",
        borderRadius: "16px",
        border: "2px solid #FDA769",
        boxShadow: "0 8px 24px rgba(71,60,51,0.12)",
      }}
    >
      <h2 style={{ color: "#473C33", marginBottom: "20px", fontWeight: 700 }}>Login</h2>

      {error && (
        <p style={{ color: "#473C33", marginBottom: "12px", fontWeight: 500 }}>{error}</p>
      )}

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "8px",
            border: "2px solid #FEC868",
            background: "rgba(255,255,255,0.9)",
            color: "#473C33",
            fontWeight: 500,
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "8px",
            border: "2px solid #FEC868",
            background: "rgba(255,255,255,0.9)",
            color: "#473C33",
            fontWeight: 500,
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "#473C33",
            color: "#FEC868",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#473C33" }}>
  Authorized users only.
</p>

      
   </div>
  );
}
