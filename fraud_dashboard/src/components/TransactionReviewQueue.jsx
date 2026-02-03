import { useState } from "react";
import api from "../services/api";

export default function TransactionReviewQueue({ transactions, onReviewComplete }) {
    const [processingId, setProcessingId] = useState(null);

    const handleAction = async (txId, action) => {
        setProcessingId(txId);
        try {
            await api.post("/review/", { transaction_id: txId, action });
            // Remove from list or update local state
            onReviewComplete(txId, action);
        } catch (err) {
            console.error("Review failed", err);
            alert("Failed to update transaction");
        } finally {
            setProcessingId(null);
        }
    };

    if (transactions.length === 0) {
        return (
            <div style={{
                padding: "24px",
                background: "linear-gradient(135deg, rgba(171,194,112,0.3) 0%, rgba(254,200,104,0.3) 100%)",
                borderRadius: "12px",
                textAlign: "center",
                color: "#473C33",
                marginBottom: "30px",
                border: "2px solid #ABC270",
                fontWeight: 500
            }}>
                <p>No transactions pending manual review.</p>
            </div>
        );
    }

    return (
        <div style={{ marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "15px", color: "#473C33", fontWeight: 600 }}>📋 Manual Review Queue</h3>
            <div style={{ display: "grid", gap: "12px" }}>
                {transactions.map((tx, i) => (
                    <div
                        key={tx.id}
                        style={{
                            padding: "16px",
                            background: i % 2 === 0 ? "rgba(254,200,104,0.15)" : "rgba(171,194,112,0.2)",
                            borderRadius: "12px",
                            border: "2px solid #FDA769",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            boxShadow: "0 2px 8px rgba(71,60,51,0.1)"
                        }}
                    >
                        <div>
                            <p style={{ margin: 0, fontWeight: "600", color: "#473C33" }}>
                                ID: #{tx.id} — ${Number(tx.amount).toLocaleString()}
                            </p>
                            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#473C33", opacity: 0.9 }}>
                                Reason: {tx.reason || "Flagged for review"}
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                onClick={() => handleAction(tx.id, "APPROVE")}
                                disabled={processingId === tx.id}
                                style={{
                                    padding: "8px 16px",
                                    background: "#ABC270",
                                    color: "#473C33",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    opacity: processingId === tx.id ? 0.7 : 1
                                }}
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleAction(tx.id, "BLOCK")}
                                disabled={processingId === tx.id}
                                style={{
                                    padding: "8px 16px",
                                    background: "#FDA769",
                                    color: "#473C33",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    opacity: processingId === tx.id ? 0.7 : 1
                                }}
                            >
                                Block
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
