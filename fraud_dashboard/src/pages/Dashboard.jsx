import { useState, useEffect } from "react";
import api from "../services/api";
import TransactionsTable from "../components/TransactionsTable";
import StatsCards from "../components/StatsCards";
import TransactionsChart from "../components/TransactionsChart";
import NewTransactionForm from "../components/NewTransactionForm";
import logo from "../assets/fraudify.png";


export default function Dashboard() {
  // Core state
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search states
  const [searchId, setSearchId] = useState("");
  const [searchAmount, setSearchAmount] = useState("");
  const [searchDecision, setSearchDecision] = useState("ALL");

  const handleTransactionAdded = (newTx) => {
    if (!newTx) {
      api.get("/transactions/").then((res) => setTransactions(res.data));
      return;
    }
    setTransactions((prev) => [newTx, ...prev]);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (activeFilter !== "ALL" && tx.decision !== activeFilter) return false;
    if (searchId && !tx.id.toString().includes(searchId)) return false;
    if (searchAmount && !tx.amount.toString().startsWith(searchAmount)) return false;
    if (searchDecision !== "ALL" && tx.decision !== searchDecision) return false;
    return true;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const txRes = await api.get("/transactions/");
        setTransactions(txRes.data);

        const statsRes = await api.get("/dashboard/stats/");
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p style={{ color: "#473C33", fontWeight: 600 }}>Loading dashboard...</p>;
  if (error) return <p style={{ color: "#FDA769", fontWeight: 600 }}>{error}</p>;

  return (
    <>
      <h1 style={{ marginBottom: "20px", color: "#473C33", fontWeight: 700, textShadow: "0 1px 2px rgba(71,60,51,0.1)" }}>Fraud Detection Dashboard</h1>

      {stats && (
        <StatsCards
          stats={stats}
          onCardClick={setActiveFilter}
          activeFilter={activeFilter}
        />
      )}

      <h3 style={{ marginTop: "30px", color: "#4b5563" }}>Sample Predict</h3>
      <NewTransactionForm onTransactionAdded={handleTransactionAdded} />

      <div style={filterBox}>
        <input
          placeholder="Transaction ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Amount"
          value={searchAmount}
          onChange={(e) => setSearchAmount(e.target.value)}
          style={inputStyle}
        />
        <select
          value={searchDecision}
          onChange={(e) => setSearchDecision(e.target.value)}
          style={inputStyle}
        >
          <option value="ALL">All</option>
          <option value="APPROVE">APPROVE</option>
          <option value="BLOCK">BLOCK</option>
          <option value="REVIEW">REVIEW</option>
          <option value="PENDING">PENDING</option>
        </select>
      </div>

      <TransactionsChart transactions={filteredTransactions} />
      <TransactionsTable transactions={filteredTransactions} />
    </>
  );
}

const inputStyle = {
  padding: "10px 14px",
  borderRadius: "8px",
  border: "2px solid #FEC868",
  background: "rgba(255,255,255,0.8)",
  color: "#473C33",
  fontWeight: 500,
};

const filterBox = {
  display: "flex",
  gap: "12px",
  margin: "20px 0",
  flexWrap: "wrap",
};
