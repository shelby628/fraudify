export default function TransactionsTable({ transactions }) {
  const getDecisionStyle = (decision) => {
    switch (decision) {
      case "APPROVE": return { bg: "rgba(171,194,112,0.6)", color: "#473C33" };
      case "BLOCK": return { bg: "rgba(253,167,105,0.7)", color: "#473C33" };
      case "REVIEW": return { bg: "rgba(254,200,104,0.7)", color: "#473C33" };
      default: return { bg: "rgba(71,60,51,0.3)", color: "#FEC868" };
    }
  };

  return (
    <div style={{ overflowX: "auto", borderRadius: "12px", boxShadow: "0 4px 14px rgba(71,60,51,0.15)", background: "#473C33", border: "2px solid #FEC868" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", color: "#f3f4f6" }}>
        <thead style={{ background: "#3A312A", borderBottom: "2px solid #FDA769" }}>
          <tr>
            <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#FEC868" }}>ID</th>
            <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#FEC868" }}>User</th>
            <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#FEC868" }}>Amount</th>
            <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#FEC868" }}>Decision</th>
            <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#FEC868" }}>Stage</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, i) => {
            const ds = getDecisionStyle(tx.decision);
            return (
              <tr
                key={tx.id}
                title={tx.reason ? `Reason: ${tx.reason}` : "No reason available"}
                style={{
                  borderBottom: "1px solid #5d5045",
                  cursor: "help",
                  transition: "background 0.2s",
                  background: i % 2 === 0 ? "rgba(71,60,51,0.5)" : "rgba(71,60,51,0.35)"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#5d5045"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? "rgba(71,60,51,0.5)" : "rgba(71,60,51,0.35)"; }}
              >
                <td style={{ padding: "16px", fontSize: "14px", color: "#e8e0d5" }}>#{tx.id}</td>
                <td style={{ padding: "16px", fontSize: "14px", color: "#d1d5db" }}>{tx.user || "N/A"}</td>
                <td style={{ padding: "16px", fontSize: "14px", fontWeight: "500", color: "#ABC270" }}>
                  ${Number(tx.amount).toLocaleString()}
                </td>
                <td style={{ padding: "16px" }}>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: ds.bg,
                    color: ds.color
                  }}>
                    {tx.decision}
                  </span>
                </td>
                <td style={{ padding: "16px", fontSize: "14px", color: "#FEC868" }}>{tx.stage}</td>
              </tr>
            );
          })}
          {transactions.length === 0 && (
            <tr>
              <td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "#FEC868" }}>
                No transactions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
