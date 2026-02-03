import { useState, useEffect } from "react";
import api from "../services/api";
import TransactionReviewQueue from "../components/TransactionReviewQueue";

export default function ManualReviewPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await api.get("/transactions/");
                // Client-side filtering for REVIEW status for now
                // Ideally backend should support ?status=REVIEW
                const reviewQueue = res.data.filter(tx => tx.decision === "REVIEW");
                setTransactions(reviewQueue);
            } catch (err) {
                console.error("Failed to fetch transactions", err);
                setError("Failed to load review queue");
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const handleReviewComplete = (txId, action) => {
        setTransactions((prev) => prev.filter(tx => tx.id !== txId));
    };

    if (loading) return <p style={{ color: "#473C33", fontWeight: 600 }}>Loading queue...</p>;
    if (error) return <p style={{ color: "#FDA769", fontWeight: 600 }}>{error}</p>;

    return (
        <div>
            <h1 style={{ color: "#473C33", marginBottom: "20px", fontWeight: 700, textShadow: "0 1px 2px rgba(71,60,51,0.1)" }}>Manual Review Queue</h1>
            <TransactionReviewQueue
                transactions={transactions}
                onReviewComplete={handleReviewComplete}
            />
        </div>
    );
}
