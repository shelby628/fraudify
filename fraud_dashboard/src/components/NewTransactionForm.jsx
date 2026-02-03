import { useState } from "react";
import api from "../services/api";

export default function NewTransactionForm({ onTransactionAdded, title = "New Transaction" }) {
  const [form, setForm] = useState({
    amount: "",
    type: "TRANSFER",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      amount: Number(form.amount),
      type: form.type,
    };

    try {
      const res = await api.post("/predict/", payload);

      // Instantly update dashboard with new transaction
      if (res.data.transaction) {
        onTransactionAdded(res.data.transaction);
      } else {
        // Fallback if backend doesn't return transaction
        onTransactionAdded(null);
      }

      // Reset form
      setForm({
        amount: "",
        type: "TRANSFER",
      });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.detail || err.message || "Prediction failed. Check inputs.";
      setError(typeof msg === "string" ? msg : "Prediction failed. Check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(171,194,112,0.25) 0%, rgba(254,200,104,0.3) 50%, rgba(253,167,105,0.2) 100%)",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "30px",
        border: "2px solid #FDA769",
        boxShadow: "0 2px 10px rgba(71,60,51,0.08)",
      }}
    >
      <h3 style={{ color: "#473C33", marginBottom: "12px", fontWeight: 600 }}>{title}</h3>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px", maxWidth: "600px" }}>
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
          style={{ padding: "10px 14px", borderRadius: "8px", border: "2px solid #FEC868", background: "rgba(255,255,255,0.9)", color: "#473C33", fontWeight: 500 }}
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          style={{ padding: "10px 14px", borderRadius: "8px", border: "2px solid #FEC868", background: "rgba(255,255,255,0.9)", color: "#473C33", fontWeight: 500 }}
        >
          <option value="TRANSFER">TRANSFER</option>
          <option value="CASH_OUT">CASH_OUT</option>
          <option value="DEBIT">DEBIT</option>
          <option value="PAYMENT">PAYMENT</option>
          <option value="CASH_IN">CASH_IN</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px",
            background: "#473C33",
            color: "#FEC868",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          {loading ? "Making..." : "Make Transaction"}
        </button>
      </form>

      {error && <p style={{ color: "#473C33", fontWeight: 500, marginTop: "8px" }}>{error}</p>}
    </div>
  );
}
