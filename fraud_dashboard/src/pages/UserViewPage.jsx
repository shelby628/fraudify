import { useEffect, useState } from "react";
import api from "../services/api";
import StatsCards from "../components/StatsCards";
import NewTransactionForm from "../components/NewTransactionForm";
import UserTransactionsTable from "../components/UserTransactionsTable";

export default function UserViewPage() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    blocked: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const username = localStorage.getItem("username") || "User";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Fetch user transactions
                const txRes = await api.get("/transactions/?view_as_user=true");
        setTransactions(txRes.data);

        // ✅ Fetch stats for the user
        const statsRes = await api.get("/dashboard/stats/me/");

        const { total, approved, blocked, pending } = statsRes.data;
        setStats({ total, approved, blocked, pending });
      } catch (err) {
        console.error("Failed to fetch user data:", err.response || err.message);
        setError("Failed to load your data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return <p style={{ color: "#473C33", fontWeight: 600 }}>Loading your dashboard...</p>;
  if (error)
    return <p style={{ color: "#FDA769", fontWeight: 600 }}>{error}</p>;

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Welcome */}
      <h1 style={{ marginBottom: "25px", color: "#473C33", fontWeight: 700 }}>
        Welcome, {username}!
      </h1>

      <StatsCards
        stats={stats}
        onCardClick={() => { /* No filtering needed for user view */ }}
        activeFilter="ALL"
      />

      {/* Transactions Table */}
      <h2 style={{ marginBottom: "20px", color: "#4b5563" }}>Your Transactions</h2>
      <UserTransactionsTable transactions={transactions} />

      <h3 style={{ marginTop: "30px", color: "#4b5563" }}>Make Transaction</h3>
      <NewTransactionForm onTransactionAdded={(newTx) => {
        if (newTx) {
          setTransactions((prev) => [newTx, ...prev]);
          // Optionally re-fetch stats to update them
          const fetchStats = async () => {
            const statsRes = await api.get("/dashboard/stats/me/");
            const { total, approved, blocked, pending } = statsRes.data;
            setStats({ total, approved, blocked, pending });
          };
          fetchStats();
        }
      }} />

      <div style={{ marginTop: "50px", paddingTop: "20px", borderTop: "1px solid #e0e0e0", textAlign: "center", color: "#777" }}>
        <h3 style={{ marginBottom: "10px", color: "#4b5563" }}>For any enquiry or problem, reach us through:</h3>
        <p style={{ margin: "5px 0" }}>Email: shelbyadede@gmail.com</p>
        <p style={{ margin: "5px 0" }}>Phone: +254707887162</p>
      </div>
    </div>
  );
}
