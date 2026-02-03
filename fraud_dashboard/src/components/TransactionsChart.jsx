import React from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#ABC270", "#FDA769", "#FEC868"];

export default function TransactionsChart({ transactions }) {
  if (!transactions || transactions.length === 0) return <p style={{ color: "#473C33", fontWeight: 500 }}>No data to display</p>;

  const chartData = [
    { name: "APPROVED", count: transactions.filter(tx => tx.decision === "APPROVE").length },
    { name: "BLOCKED", count: transactions.filter(tx => tx.decision === "BLOCK").length },
    { name: "PENDING", count: transactions.filter(tx => tx.decision === "PENDING").length },
  ];

  return (
    <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: "12px", padding: "16px", border: "2px solid #FEC868", marginBottom: "24px", boxShadow: "0 2px 10px rgba(71,60,51,0.08)" }}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" stroke="#473C33" />
          <YAxis stroke="#473C33" />
          <Tooltip contentStyle={{ background: "#473C33", color: "#FEC868", border: "none", borderRadius: "8px" }} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
