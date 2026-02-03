const containerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "16px",
  marginBottom: "30px",
};

const cardStyle = {
  padding: "18px",
  borderRadius: "12px",
  boxShadow: "0 4px 14px rgba(71,60,51,0.12)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  cursor: "pointer",
  border: "2px solid transparent",
};

const labelStyle = {
  fontSize: "14px",
  marginBottom: "8px",
  fontWeight: 600,
};

const valueStyle = {
  margin: 0,
  fontSize: "28px",
  fontWeight: "bold",
};

const PALETTE = ["#473C33", "#ABC270", "#FEC868", "#FDA769"];

export default function StatsCards({ stats, onCardClick, activeFilter }) {
  if (!stats) return null;

  const cards = [
    { title: "Total Transactions", value: stats.total, filter: "ALL" },
    { title: "Approved", value: stats.approved, filter: "APPROVED" },
    { title: "Blocked", value: stats.blocked, filter: "BLOCKED" },
    { title: "Pending", value: stats.pending, filter: "PENDING" },
  ];

  const isClickable = typeof onCardClick === "function";

  return (
    <div style={containerStyle}>
      {cards.map((card, index) => {
        const isActive = isClickable && activeFilter === card.filter;
        const accent = PALETTE[index % PALETTE.length];
        const bgLight = index === 0 ? "rgba(71,60,51,0.08)" : index === 1 ? "rgba(171,194,112,0.35)" : index === 2 ? "rgba(254,200,104,0.4)" : "rgba(253,167,105,0.35)";
        const bgActive = index === 0 ? "#e8e4e0" : index === 1 ? "#d4e4a8" : index === 2 ? "#fef0c8" : "#fde4d0";

        return (
          <div
            key={index}
            onClick={isClickable ? () => onCardClick(card.filter) : undefined}
            style={{
              ...cardStyle,
              cursor: isClickable ? "pointer" : "default",
              borderLeft: `6px solid ${accent}`,
              background: isActive ? bgActive : bgLight,
              color: "#473C33",
              transform: isActive ? "translateY(-4px)" : "translateY(0)",
              boxShadow: isActive ? "0 8px 20px rgba(71,60,51,0.2)" : cardStyle.boxShadow,
            }}
            onMouseEnter={isClickable ? (e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(71,60,51,0.2)";
            } : undefined}
            onMouseLeave={isClickable ? (e) => {
              if (!isActive) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = cardStyle.boxShadow;
              }
            } : undefined}
          >
            <p style={{ ...labelStyle, color: "#473C33" }}>{card.title}</p>
            <h2 style={{ ...valueStyle, color: accent }}>
              {card.value}
            </h2>
          </div>
        );
      })}
    </div>
  );
}
