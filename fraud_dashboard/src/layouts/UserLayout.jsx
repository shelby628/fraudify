// src/layouts/UserLayout.jsx
import React from "react";

export default function UserLayout({ children }) {
  return (
    <div style={{ padding: "20px", background: "#f5f5f5", minHeight: "100vh" }}>
      {/* You can add a user navbar here later */}
      {children}
    </div>
  );
}
