import { useState, useEffect } from "react";
import api from "../services/api";

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/audit-logs/")
            .then((res) => {
                setLogs(res.data);
            })
            .catch((err) => {
                console.error("Failed to fetch logs", err);
                setError("Failed to load audit logs");
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p style={{ padding: "20px", color: "#473C33", fontWeight: 600 }}>Loading logs...</p>;
    if (error) return <p style={{ padding: "20px", color: "#FDA769", fontWeight: 600 }}>{error}</p>;

    return (
        <div style={{ padding: "20px" }}>
            <h1 style={{ color: "#473C33", marginBottom: "20px", fontWeight: 700, textShadow: "0 1px 2px rgba(71,60,51,0.1)" }}>🛡️ System Audit Logs</h1>

            <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 14px rgba(71,60,51,0.12)", overflow: "hidden", border: "2px solid #FEC868" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#473C33", borderBottom: "2px solid #FDA769" }}>
                        <tr>
                            <th style={thStyle}>Timestamp</th>
                            <th style={thStyle}>User</th>
                            <th style={thStyle}>Action</th>
                            <th style={thStyle}>Transaction ID</th>
                            <th style={thStyle}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, i) => (
                            <tr key={log.id} style={{ borderBottom: "1px solid #e8e0d5", background: i % 2 === 0 ? "rgba(254,200,104,0.08)" : "rgba(171,194,112,0.08)" }}>
                                <td style={tdStyle}>{log.timestamp}</td>
                                <td style={tdStyle}>{log.user}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        padding: "4px 10px",
                                        borderRadius: "6px",
                                        background: log.action.includes("BLOCK") ? "rgba(253,167,105,0.4)" : "rgba(171,194,112,0.5)",
                                        color: log.action.includes("BLOCK") ? "#473C33" : "#473C33",
                                        fontSize: "12px",
                                        fontWeight: "600"
                                    }}>
                                        {log.action}
                                    </span>
                                </td>
                                <td style={tdStyle}>{log.txn_id ? `#${log.txn_id}` : "-"}</td>
                                <td style={tdStyle}>{log.details}</td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#473C33" }}>
                                    No audit logs recorded yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: "20px" }}>
                <a href="/dashboard" style={{ color: "#473C33", fontWeight: 600, textDecoration: "none" }}>&larr; Back to Dashboard</a>
            </div>
        </div>
    );
}

const thStyle = {
    textAlign: "left",
    padding: "16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#FEC868",
    textTransform: "uppercase"
};

const tdStyle = {
    padding: "16px",
    fontSize: "14px",
    color: "#473C33",
    fontWeight: 500
};
